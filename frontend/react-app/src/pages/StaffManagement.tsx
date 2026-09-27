import { useMemo, useState, type CSSProperties } from 'react'

type Staff = {
  id: number
  name: string
  username: string
  email: string
  role: 'Cashier' | 'Staff'
  status: 'Active' | 'Inactive'
  dateJoined: string
  initials: string
}

type ActionType = 'deactivate' | 'activate' | 'delete' | null

const initialStaff: Staff[] = [
  {
    id: 1,
    name: 'Juan dela Cruz',
    username: '@jdelacruz',
    email: 'juan.delacruz@grocerytrack.com',
    role: 'Cashier',
    status: 'Active',
    dateJoined: 'Jan 12, 2024',
    initials: 'JC',
  },
  {
    id: 2,
    name: 'Ana Maria Reyes',
    username: '@amreyes',
    email: 'ana.reyes@grocerytrack.com',
    role: 'Staff',
    status: 'Active',
    dateJoined: 'Mar 5, 2024',
    initials: 'AR',
  },
  {
    id: 3,
    name: 'Carlos Bautista',
    username: '@cbautista',
    email: 'carlos.bautista@grocerytrack.com',
    role: 'Cashier',
    status: 'Active',
    dateJoined: 'May 20, 2024',
    initials: 'CB',
  },
  {
    id: 4,
    name: 'Liza Fernandez',
    username: '@lfernandez',
    email: 'liza.fernandez@grocerytrack.com',
    role: 'Staff',
    status: 'Inactive',
    dateJoined: 'Jun 1, 2024',
    initials: 'LF',
  },
  {
    id: 5,
    name: 'Ramon Santos',
    username: '@rsantos',
    email: 'ramon.santos@grocerytrack.com',
    role: 'Cashier',
    status: 'Active',
    dateJoined: 'Aug 14, 2024',
    initials: 'RS',
  },
  {
    id: 6,
    name: 'Grace Villanueva',
    username: '@gvillanueva',
    email: 'grace.villanueva@grocerytrack.com',
    role: 'Staff',
    status: 'Active',
    dateJoined: 'Sep 3, 2024',
    initials: 'GV',
  },
]

const avatarColors = [
  '#198754',
  '#6f42c1',
  '#fd7e14',
  '#20c997',
  '#0dcaf0',
  '#d63384',
]

function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>(initialStaff)
  const [search, setSearch] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [actionType, setActionType] = useState<ActionType>(null)
  const [toast, setToast] = useState<string | null>(null)

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

  const showToast = (message: string) => {
    setToast(message)

    window.setTimeout(() => {
      setToast(null)
    }, 3000)
  }

  const openConfirmation = (
    member: Staff,
    action: ActionType,
  ) => {
    setSelectedStaff(member)
    setActionType(action)
  }

  const closeConfirmation = () => {
    setSelectedStaff(null)
    setActionType(null)
  }

  const confirmAction = () => {
    if (!selectedStaff || !actionType) {
      return
    }

    if (actionType === 'delete') {
      const deletedName = selectedStaff.name

      setStaff((currentStaff) =>
        currentStaff.filter(
          (member) => member.id !== selectedStaff.id,
        ),
      )

      closeConfirmation()
      showToast(`${deletedName}'s account was deleted.`)
      return
    }

    if (actionType === 'deactivate') {
      const staffName = selectedStaff.name

      setStaff((currentStaff) =>
        currentStaff.map((member) =>
          member.id === selectedStaff.id
            ? { ...member, status: 'Inactive' }
            : member,
        ),
      )

      closeConfirmation()
      showToast(`${staffName}'s account was deactivated.`)
      return
    }

    if (actionType === 'activate') {
      const staffName = selectedStaff.name

      setStaff((currentStaff) =>
        currentStaff.map((member) =>
          member.id === selectedStaff.id
            ? { ...member, status: 'Active' }
            : member,
        ),
      )

      closeConfirmation()
      showToast(`${staffName}'s account was activated.`)
    }
  }

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

  const renderSearchIcon = () => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )

  const renderPlusIcon = () => (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  )

  const renderEditIcon = () => (
    <img
      src="/assets/edit icon.png"
      alt=""
      style={iconImageStyle}
    />
  )

  const renderDeleteIcon = () => (
    <img
      src="/assets/delete icon.png"
      alt=""
      style={iconImageStyle}
    />
  )

  const renderAccountActionIcon = (status: Staff['status']) => (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {status === 'Active' ? (
        <>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </>
      ) : (
        <>
          <rect x="5" y="10" width="14" height="10" rx="2" />
          <path d="M8 10V7a4 4 0 0 1 8-1.5" />
        </>
      )}
    </svg>
  )

  const renderCloseIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="m6 6 12 12" />
      <path d="M18 6 6 18" />
    </svg>
  )

  const renderToastIcon = () => (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 2.5 2.5L16.5 9" />
    </svg>
  )

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

            <div
              style={{
                fontSize: '11px',
                color: '#adb5bd',
              }}
            >
              {staff.length} total accounts
              <span style={{ margin: '0 5px' }}>•</span>
              <span style={{ color: '#198754' }}>
                {activeCount} active
              </span>
            </div>
          </div>

          {/* Visual only - Add Staff belongs to another FE task */}
          <button
            type="button"
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
              cursor: 'default',
            }}
          >
            {renderPlusIcon()}
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
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                position: 'relative',
                flex: 1,
              }}
            >
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
                {renderSearchIcon()}
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
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
                  <th style={tableHeaderStyle}>
                    Full Name
                  </th>

                  <th style={tableHeaderStyle}>
                    Username / Email
                  </th>

                  <th style={tableHeaderStyle}>Role</th>

                  <th style={tableHeaderStyle}>Status</th>

                  <th style={tableHeaderStyle}>
                    Date Joined
                  </th>

                  <th
                    style={{
                      ...tableHeaderStyle,
                      textAlign: 'center',
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.map((member, index) => (
                  <tr
                    key={member.id}
                    style={{
                      borderBottom: '1px solid #f1f3f5',
                    }}
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
                              avatarColors[
                                index % avatarColors.length
                              ],
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

                      <div
                        style={{
                          color: '#adb5bd',
                          fontSize: '10px',
                        }}
                      >
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
                            member.role === 'Cashier'
                              ? '#cfe2ff'
                              : '#e9ecef',
                          color:
                            member.role === 'Cashier'
                              ? '#084298'
                              : '#495057',
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

                    {/* Actions */}
                    <td
                      style={{
                        ...tableCellStyle,
                        textAlign: 'center',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                      >
                        {/* Edit - visual only */}
                        <button
                          type="button"
                          title="Edit"
                          aria-label={`Edit ${member.name}`}
                          style={actionButtonStyle}
                        >
                          {renderEditIcon()}
                        </button>

                        {/* Deactivate / Activate - working */}
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
                          {renderAccountActionIcon(member.status)}
                        </button>

                        {/* Delete - working */}
                        <button
                          type="button"
                          title="Delete"
                          aria-label={`Delete ${member.name}`}
                          onClick={() =>
                            openConfirmation(member, 'delete')
                          }
                          style={actionButtonStyle}
                        >
                          {renderDeleteIcon()}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

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
            Showing {filteredStaff.length} of {staff.length}{' '}
            accounts
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
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
                {renderCloseIcon()}
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
            {renderToastIcon()}
          </span>

          <span>{toast}</span>
        </div>
      )}
    </>
  )
}

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

const iconImageStyle: CSSProperties = {
  width: '15px',
  height: '15px',
  objectFit: 'contain',
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