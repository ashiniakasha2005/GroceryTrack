import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { StaffForm } from '../components/staffform'

type StaffRole = 'Admin' | 'Staff'

type Staff = {
  id: number
  name: string
  username: string
  email: string
  role: StaffRole
  status: 'Active' | 'Inactive'
  dateJoined: string
  initials: string
}

type ActionType = 'deactivate' | 'activate' | 'delete' | null

type FormState =
  | {
      mode: 'add'
    }
  | {
      mode: 'edit'
      staff: Staff
    }
  | null

const avatarColors = [
  '#198754',
  '#6f42c1',
  '#fd7e14',
  '#20c997',
  '#0dcaf0',
  '#d63384',
]

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function stripAt(username: string) {
  return username.replace(/^@/, '').trim().toLowerCase()
}

function formatDateJoined(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const API_URL = 'http://localhost:3000/api'

type ApiStaff = {
  id: number
  name: string
  username: string
  email: string
  role?: string | null
  created_at: string
}

type StaffFormValues = {
  fullName: string
  username: string
  email: string
  password?: string
  role: StaffRole
  id?: string
}

async function request(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

// The database has no active/inactive column yet,
// so the status is remembered in this browser only.
const STATUS_STORAGE_KEY = 'grocerytrack_staff_status'

function loadStatuses(): Record<string, Staff['status']> {
  try {
    const saved = localStorage.getItem(STATUS_STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function saveStatus(id: number, status: Staff['status']) {
  try {
    const statuses = loadStatuses()
    statuses[String(id)] = status
    localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(statuses))
  } catch (error) {
    console.error('Could not save staff status:', error)
  }
}

function toStaff(item: ApiStaff): Staff {
  return {
    id: item.id,
    name: item.name,
    username: `@${item.username}`,
    email: item.email,
    role: String(item.role ?? '').toLowerCase() === 'admin' ? 'Admin' : 'Staff',
    status: loadStatuses()[String(item.id)] ?? 'Active',
    dateJoined: formatDateJoined(new Date(item.created_at)),
    initials: getInitials(item.name),
  }
}

/* ---------------------------
   Icons
---------------------------- */

const iconProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...iconProps}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
)

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...iconProps} strokeWidth={2}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...iconProps}>
    <path d="M12 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    <path d="M18.4 2.6a2 2 0 0 1 2.8 2.8L11 15.6 7 16.6l1-4z" />
  </svg>
)

const DeleteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...iconProps}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
  </svg>
)

// Closed padlock = account is active (click to deactivate)
// Open padlock   = account is inactive (click to activate)
const LockIcon = ({ locked }: { locked: boolean }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" {...iconProps}>
    <rect x="5" y="10" width="14" height="10" rx="2" />
    {locked ? (
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    ) : (
      <path d="M8 10V7a4 4 0 0 1 7.5-1.9" />
    )}
  </svg>
)

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...iconProps} strokeWidth={1.8}>
    <path d="m6 6 12 12" />
    <path d="M18 6 6 18" />
  </svg>
)

const ToastIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" {...iconProps} strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12 2.5 2.5L16.5 9" />
  </svg>
)

function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>([])

  const [search, setSearch] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [actionType, setActionType] = useState<ActionType>(null)
  const [toast, setToast] = useState<string | null>(null)

  const [formState, setFormState] = useState<FormState>(null)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)

  const loadStaff = async () => {
    const data: ApiStaff[] = await request('/staff')

    // Oldest first, so new accounts appear at the bottom of the list
    setStaff([...data].sort((a, b) => a.id - b.id).map(toStaff))
  }

  useEffect(() => {
    let cancelled = false

    request('/staff')
      .then((data: ApiStaff[]) => {
        if (cancelled) return

        setStaff([...data].sort((a, b) => a.id - b.id).map(toStaff))
      })
      .catch((error) => {
        if (cancelled) return

        console.error('Could not load staff accounts:', error)
        setToast(
          error instanceof Error
            ? error.message
            : 'Could not load staff accounts.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [])

  const activeCount = staff.filter(
    (member) => member.status === 'Active',
  ).length

  const filteredStaff = useMemo(() => {
    const searchValue = search.toLowerCase().trim()

    if (!searchValue) {
      return staff
    }

    return staff.filter(
      (member) =>
        member.name.toLowerCase().includes(searchValue) ||
        member.username.toLowerCase().includes(searchValue) ||
        member.email.toLowerCase().includes(searchValue),
    )
  }, [search, staff])

  /*
   * These lists are passed to StaffForm so it can detect
   * duplicate usernames and emails while adding/editing.
   */
  const existingUsernames = useMemo(
    () => staff.map((member) => stripAt(member.username)),
    [staff],
  )

  const existingEmails = useMemo(
    () => staff.map((member) => member.email.toLowerCase()),
    [staff],
  )

  const showToast = (message: string) => {
    setToast(message)

    window.setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  /* ---------------------------
     Confirmation actions
  ---------------------------- */

  const openConfirmation = (member: Staff, action: ActionType) => {
    setSelectedStaff(member)
    setActionType(action)
  }

  const closeConfirmation = () => {
    setSelectedStaff(null)
    setActionType(null)
  }

  const confirmAction = async () => {
    if (!selectedStaff || !actionType) {
      return
    }

    const staffName = selectedStaff.name

    if (actionType === 'delete') {
      try {
        await request(`/staff/${selectedStaff.id}`, {
          method: 'DELETE',
        })

        await loadStaff()
        closeConfirmation()
        showToast(`${staffName}'s account was deleted.`)
      } catch (error) {
        closeConfirmation()
        showToast(
          error instanceof Error
            ? error.message
            : 'Could not delete the account.',
        )
      }

      return
    }

    const nextStatus: Staff['status'] =
      actionType === 'deactivate' ? 'Inactive' : 'Active'

    saveStatus(selectedStaff.id, nextStatus)

    setStaff((currentStaff) =>
      currentStaff.map((member) =>
        member.id === selectedStaff.id
          ? { ...member, status: nextStatus }
          : member,
      ),
    )

    closeConfirmation()
    showToast(
      `${staffName}'s account was ${
        actionType === 'deactivate' ? 'deactivated' : 'activated'
      }.`,
    )
  }

  /* ---------------------------
     Add / Edit form actions
  ---------------------------- */

  const openAddForm = () => {
    setFormState({ mode: 'add' })
  }

  const openEditForm = (member: Staff) => {
    setFormState({ mode: 'edit', staff: member })
  }

  const closeForm = () => {
    if (isSubmittingForm) {
      return
    }

    setFormState(null)
  }

  /*
   * StaffForm sends: fullName, username, email, role, id, password.
   * We convert that into the body the backend API expects.
   */
  const handleStaffFormSubmit = async (values: StaffFormValues) => {
    setIsSubmittingForm(true)

    try {
      const body: Record<string, string> = {
        name: values.fullName.trim(),
        username: stripAt(values.username),
        email: values.email.trim().toLowerCase(),
        role: values.role.toLowerCase(),
      }

      if (values.password) {
        body.password = values.password
      }

      if (formState?.mode === 'edit') {
        await request(`/staff/${values.id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        })
      } else {
        await request('/staff', {
          method: 'POST',
          body: JSON.stringify(body),
        })
      }

      await loadStaff()

      showToast(
        formState?.mode === 'edit'
          ? 'Staff account updated successfully.'
          : 'Staff account created successfully.',
      )

      setFormState(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Something went wrong.'

      // Tell the form which field is the problem, if the API says so
      if (/username/i.test(message) && /already/i.test(message)) {
        throw { field: 'username', message }
      }

      if (/email/i.test(message) && /already/i.test(message)) {
        throw { field: 'email', message }
      }

      throw { message }
    } finally {
      setIsSubmittingForm(false)
    }
  }

  /* ---------------------------
     Modal text
  ---------------------------- */

  const getModalTitle = () => {
    if (actionType === 'delete') {
      return 'Delete Staff Account'
    }

    if (actionType === 'deactivate') {
      return 'Deactivate Staff Account'
    }

    return 'Activate Staff Account'
  }

  const getModalMessage = () => {
    if (!selectedStaff) {
      return ''
    }

    if (actionType === 'delete') {
      return `Are you sure you want to delete ${selectedStaff.name}'s account? This action cannot be undone.`
    }

    if (actionType === 'deactivate') {
      return `Are you sure you want to deactivate ${selectedStaff.name}'s account? They will no longer be able to access the system.`
    }

    return `Are you sure you want to activate ${selectedStaff.name}'s account?`
  }

  const getConfirmButtonStyle = (): CSSProperties => {
    if (actionType === 'activate') {
      return {
        ...primaryButtonStyle,
        backgroundColor: '#198754',
      }
    }

    return dangerButtonStyle
  }

  return (
    <>
      <div
        style={{
          minHeight: 'calc(100vh - 56px)',
          backgroundColor: '#f0f2f5',
          margin: '-24px',
          padding: '24px 28px',
          fontFamily:
            'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: '#212529',
        }}
      >
        {/* Page Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '18px',
            gap: '20px',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                marginBottom: '6px',
                fontSize: '18px',
                fontWeight: 600,
                color: '#343a40',
              }}
            >
              Manage Staff Accounts
            </h2>

            <div style={{ fontSize: '11px', color: '#adb5bd' }}>
              {staff.length} total accounts
              <span style={{ margin: '0 5px' }}>•</span>
              <span style={{ color: '#198754' }}>{activeCount} active</span>
            </div>
          </div>

          {/* Add New Staff */}
          <button
            type="button"
            onClick={openAddForm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '7px',
              minHeight: '32px',
              padding: '8px 14px',
              border: 'none',
              borderRadius: '6px',
              backgroundColor: '#0d6efd',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <PlusIcon />
            Add New Staff
          </button>
        </div>

        {/* Search Card */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#adb5bd',
                  display: 'flex',
                  alignItems: 'center',
                  pointerEvents: 'none',
                }}
              >
                <SearchIcon />
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, username, or email..."
                style={{
                  width: '100%',
                  height: '36px',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  padding: '8px 12px 8px 34px',
                  fontSize: '12px',
                  color: '#495057',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: '#fff',
                }}
              />
            </div>

            <span
              style={{
                color: '#adb5bd',
                fontSize: '11px',
                whiteSpace: 'nowrap',
              }}
            >
              {filteredStaff.length} of {staff.length} staff
            </span>
          </div>
        </div>

        {/* Staff Table */}
        <div
          style={{
            backgroundColor: '#fff',
            border: '1px solid #e9ecef',
            borderRadius: '10px',
            overflow: 'hidden',
          }}
        >
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                minWidth: '850px',
                borderCollapse: 'collapse',
                fontSize: '12px',
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e9ecef',
                  }}
                >
                  <th style={tableHeaderStyle}>Full Name</th>
                  <th style={tableHeaderStyle}>Username / Email</th>
                  <th style={tableHeaderStyle}>Role</th>
                  <th style={tableHeaderStyle}>Status</th>
                  <th style={tableHeaderStyle}>Date Joined</th>
                  <th style={tableHeaderStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.map((member) => {
                  // Keep each person's avatar colour stable, even while searching
                  const colorIndex = staff.findIndex(
                    (item) => item.id === member.id,
                  )

                  return (
                    <tr
                      key={member.id}
                      style={{ borderBottom: '1px solid #f1f3f5' }}
                    >
                      {/* Full Name */}
                      <td style={tableCellStyle}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              backgroundColor:
                                avatarColors[colorIndex % avatarColors.length],
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              fontSize: '10px',
                              fontWeight: 600,
                            }}
                          >
                            {member.initials}
                          </div>

                          <span
                            style={{
                              fontWeight: 500,
                              color: '#343a40',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {member.name}
                          </span>
                        </div>
                      </td>

                      {/* Username / Email */}
                      <td style={tableCellStyle}>
                        <div
                          style={{
                            color: '#495057',
                            fontSize: '11px',
                            marginBottom: '3px',
                          }}
                        >
                          {member.username}
                        </div>

                        <div style={{ color: '#adb5bd', fontSize: '10px' }}>
                          {member.email}
                        </div>
                      </td>

                      {/* Role */}
                      <td style={tableCellStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              member.role === 'Admin' ? '#cfe2ff' : '#e9ecef',
                            color:
                              member.role === 'Admin' ? '#084298' : '#495057',
                            fontSize: '10px',
                            fontWeight: 600,
                          }}
                        >
                          {member.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={tableCellStyle}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              member.status === 'Active'
                                ? '#d1e7dd'
                                : '#e9ecef',
                            color:
                              member.status === 'Active'
                                ? '#0a3622'
                                : '#6c757d',
                            fontSize: '10px',
                            fontWeight: 500,
                          }}
                        >
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor:
                                member.status === 'Active'
                                  ? '#198754'
                                  : '#adb5bd',
                            }}
                          />

                          {member.status}
                        </span>
                      </td>

                      {/* Date Joined */}
                      <td
                        style={{
                          ...tableCellStyle,
                          color: '#adb5bd',
                          fontSize: '10px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {member.dateJoined}
                      </td>

                      {/* Actions: Edit / Lock / Delete */}
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {/* Edit (name, username, email, role, password) */}
                          <button
                            type="button"
                            title="Edit"
                            aria-label={`Edit ${member.name}`}
                            onClick={() => openEditForm(member)}
                            style={actionButtonStyle}
                          >
                            <EditIcon />
                          </button>

                          {/* Deactivate / Activate */}
                          <button
                            type="button"
                            title={
                              member.status === 'Active'
                                ? 'Deactivate'
                                : 'Activate'
                            }
                            aria-label={
                              member.status === 'Active'
                                ? `Deactivate ${member.name}`
                                : `Activate ${member.name}`
                            }
                            onClick={() =>
                              openConfirmation(
                                member,
                                member.status === 'Active'
                                  ? 'deactivate'
                                  : 'activate',
                              )
                            }
                            style={{
                              ...actionButtonStyle,
                              color:
                                member.status === 'Active'
                                  ? '#6c757d'
                                  : '#198754',
                            }}
                          >
                            <LockIcon locked={member.status === 'Active'} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            title="Delete"
                            aria-label={`Delete ${member.name}`}
                            onClick={() => openConfirmation(member, 'delete')}
                            style={actionButtonStyle}
                          >
                            <DeleteIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredStaff.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      style={{
                        padding: '42px 16px',
                        textAlign: 'center',
                        color: '#adb5bd',
                        fontSize: '12px',
                      }}
                    >
                      No staff accounts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div
            style={{
              padding: '10px 14px',
              borderTop: '1px solid #e9ecef',
              color: '#adb5bd',
              fontSize: '10px',
            }}
          >
            Showing {filteredStaff.length} of {staff.length} accounts
          </div>
        </div>
      </div>

      {/* Add / Edit Staff Form */}
      {formState && (
        <StaffForm
          mode={formState.mode}
          staff={
            formState.mode === 'edit'
              ? {
                  id: String(formState.staff.id),
                  fullName: formState.staff.name,
                  username: stripAt(formState.staff.username),
                  email: formState.staff.email,
                  role: formState.staff.role,
                  status:
                    formState.staff.status === 'Active'
                      ? 'active'
                      : 'inactive',
                }
              : undefined
          }
          isSubmitting={isSubmittingForm}
          canManageStaff={true}
          existingUsernames={existingUsernames}
          existingEmails={existingEmails}
          onClose={closeForm}
          onSubmit={handleStaffFormSubmit}
        />
      )}

      {/* Confirmation Modal (delete / deactivate / activate) */}
      {selectedStaff && actionType && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            {/* Header */}
            <div style={modalHeaderStyle}>
              <h3
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#343a40',
                }}
              >
                {getModalTitle()}
              </h3>

              <button
                type="button"
                onClick={closeConfirmation}
                aria-label="Close"
                style={closeButtonStyle}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Body */}
            <div style={modalBodyStyle}>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  lineHeight: 1.7,
                  color: '#6c757d',
                }}
              >
                {getModalMessage()}
              </p>
            </div>

            {/* Footer */}
            <div style={modalFooterStyle}>
              <button
                type="button"
                onClick={closeConfirmation}
                style={secondaryButtonStyle}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmAction}
                style={getConfirmButtonStyle()}
              >
                {actionType === 'delete'
                  ? 'Delete Account'
                  : actionType === 'deactivate'
                    ? 'Deactivate'
                    : 'Activate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            right: '24px',
            bottom: '24px',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            minWidth: '260px',
            maxWidth: '380px',
            padding: '12px 14px',
            borderRadius: '8px',
            backgroundColor: '#fff',
            border: '1px solid #d1e7dd',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            color: '#0a3622',
            fontSize: '12px',
          }}
        >
          <span
            style={{
              color: '#198754',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ToastIcon />
          </span>

          <span>{toast}</span>
        </div>
      )}
    </>
  )
}

/* ---------------------------
   Styles
---------------------------- */

const tableHeaderStyle: CSSProperties = {
  padding: '11px 16px',
  color: '#adb5bd',
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.35px',
  textAlign: 'left',
  whiteSpace: 'nowrap',
}

const tableCellStyle: CSSProperties = {
  padding: '11px 16px',
  verticalAlign: 'middle',
}

const actionButtonStyle: CSSProperties = {
  width: '32px',
  height: '32px',
  padding: 0,
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  backgroundColor: '#fff',
  color: '#6c757d',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1500,
  backgroundColor: 'rgba(33, 37, 41, 0.50)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
}

const modalStyle: CSSProperties = {
  width: '100%',
  maxWidth: '420px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
  overflow: 'hidden',
}

const modalHeaderStyle: CSSProperties = {
  minHeight: '54px',
  padding: '12px 18px',
  borderBottom: '1px solid #e9ecef',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const modalBodyStyle: CSSProperties = {
  padding: '18px',
}

const modalFooterStyle: CSSProperties = {
  padding: '11px 18px',
  borderTop: '1px solid #e9ecef',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
}

const secondaryButtonStyle: CSSProperties = {
  minHeight: '30px',
  padding: '7px 14px',
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  backgroundColor: '#fff',
  color: '#495057',
  fontSize: '11px',
  fontWeight: 500,
  cursor: 'pointer',
}

const primaryButtonStyle: CSSProperties = {
  minHeight: '30px',
  padding: '7px 14px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#0d6efd',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
}

const dangerButtonStyle: CSSProperties = {
  minHeight: '30px',
  padding: '7px 14px',
  border: 'none',
  borderRadius: '6px',
  backgroundColor: '#dc3545',
  color: '#fff',
  fontSize: '11px',
  fontWeight: 600,
  cursor: 'pointer',
}

const closeButtonStyle: CSSProperties = {
  width: '28px',
  height: '28px',
  padding: 0,
  border: 'none',
  backgroundColor: 'transparent',
  color: '#adb5bd',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
}

export default StaffManagement