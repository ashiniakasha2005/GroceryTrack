import { useMemo, useState } from 'react'

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

type ModalMode = 'add' | 'edit' | 'reset' | 'delete' | null

type FormData = {
  name: string
  username: string
  email: string
  password: string
  role: 'Staff'
}

type FormErrors = Partial<Record<keyof FormData, string>>

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

const emptyForm: FormData = {
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'Staff',
}

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

  const [modalMode, setModalMode] = useState<ModalMode>(null)
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)

  const [formData, setFormData] = useState<FormData>(emptyForm)
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showPassword, setShowPassword] = useState(false)

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

  const getInitials = (name: string) => {
    const parts = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    if (parts.length === 0) {
      return 'ST'
    }

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase()
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  }

  const openAddModal = () => {
    setSelectedStaff(null)
    setFormData(emptyForm)
    setFormErrors({})
    setShowPassword(false)
    setModalMode('add')
  }

  const openEditModal = (member: Staff) => {
    setSelectedStaff(member)

    setFormData({
      name: member.name,
      username: member.username.replace(/^@/, ''),
      email: member.email,
      password: '',
      role: 'Staff',
    })

    setFormErrors({})
    setShowPassword(false)
    setModalMode('edit')
  }

  const openResetModal = (member: Staff) => {
    setSelectedStaff(member)

    setFormData({
      name: member.name,
      username: member.username.replace(/^@/, ''),
      email: member.email,
      password: '',
      role: 'Staff',
    })

    setFormErrors({})
    setShowPassword(false)
    setModalMode('reset')
  }

  const openDeleteModal = (member: Staff) => {
    setSelectedStaff(member)
    setModalMode('delete')
  }

  const closeModal = () => {
    setModalMode(null)
    setSelectedStaff(null)
    setFormData(emptyForm)
    setFormErrors({})
    setShowPassword(false)
  }

  const handleInputChange = (
    field: keyof FormData,
    value: string,
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))

    if (formErrors[field]) {
      setFormErrors((current) => ({
        ...current,
        [field]: undefined,
      }))
    }
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8 && /\d/.test(password)
  }

  const validateForm = () => {
    const errors: FormErrors = {}

    if (!formData.name.trim()) {
      errors.name = 'Full name is required.'
    }

    if (!formData.username.trim()) {
      errors.username = 'Username is required.'
    } else if (
      formData.username.trim().length < 4 ||
      formData.username.trim().length > 20
    ) {
      errors.username = 'Username must be 4–20 characters.'
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required.'
    } else if (!validateEmail(formData.email.trim())) {
      errors.email = 'Enter a valid email address.'
    }

    if (modalMode === 'add') {
      if (!formData.password) {
        errors.password = 'Password is required.'
      } else if (!validatePassword(formData.password)) {
        errors.password =
          'Password must be at least 8 characters and contain a number.'
      }
    }

    if (modalMode === 'reset') {
      if (!formData.password) {
        errors.password = 'New password is required.'
      } else if (!validatePassword(formData.password)) {
        errors.password =
          'Password must be at least 8 characters and contain a number.'
      }
    }

    setFormErrors(errors)

    return Object.keys(errors).length === 0
  }

  const handleSaveStaff = () => {
    if (!validateForm()) {
      return
    }

    if (modalMode === 'add') {
      const newId =
        staff.length > 0
          ? Math.max(...staff.map((member) => member.id)) + 1
          : 1

      const newStaff: Staff = {
        id: newId,
        name: formData.name.trim(),
        username: `@${formData.username.trim().replace(/^@/, '')}`,
        email: formData.email.trim(),
        role: 'Staff',
        status: 'Active',
        dateJoined: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        initials: getInitials(formData.name),
      }

      setStaff((current) => [...current, newStaff])
      closeModal()
      showToast('Staff account created successfully.')
      return
    }

    if (modalMode === 'edit' && selectedStaff) {
      setStaff((current) =>
        current.map((member) =>
          member.id === selectedStaff.id
            ? {
                ...member,
                name: formData.name.trim(),
                username: `@${formData.username
                  .trim()
                  .replace(/^@/, '')}`,
                email: formData.email.trim(),
                initials: getInitials(formData.name),
              }
            : member,
        ),
      )

      closeModal()
      showToast('Staff account updated successfully.')
    }
  }

  const handleResetPassword = () => {
    if (!formData.password) {
      setFormErrors({
        password: 'New password is required.',
      })
      return
    }

    if (!validatePassword(formData.password)) {
      setFormErrors({
        password:
          'Password must be at least 8 characters and contain a number.',
      })
      return
    }

    closeModal()
    showToast('Password reset successfully.')
  }

  const handleDelete = () => {
    if (!selectedStaff) {
      return
    }

    setStaff((current) =>
      current.filter((member) => member.id !== selectedStaff.id),
    )

    const deletedName = selectedStaff.name

    closeModal()
    showToast(`${deletedName}'s account was deleted.`)
  }

  const renderActionIcon = (
    type: 'edit' | 'reset' | 'delete',
  ) => {
    if (type === 'edit') {
      return (
        <img
          src="/assets/edit icon.png"
          alt=""
          style={iconImageStyle}
        />
      )
    }

    if (type === 'delete') {
      return (
        <img
          src="/assets/delete icon.png"
          alt=""
          style={iconImageStyle}
        />
      )
    }

    return (
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
        <rect x="5" y="10" width="14" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        <path d="M9 5.5 6.5 8" />
        <path d="M15 5.5 17.5 8" />
      </svg>
    )
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

  const renderStaffIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19c.8-3.2 3.3-5 7-5s6.2 1.8 7 5" />
      <path d="M4 7h1" />
      <path d="M19 7h1" />
    </svg>
  )

  const renderEyeIcon = () => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 12s3.2-5 9.5-5 9.5 5 9.5 5-3.2 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.2" />
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

          <button
            type="button"
            onClick={openAddModal}
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

                    {/* Date */}
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
                        {/* Edit */}
                        <button
                          type="button"
                          title="Edit"
                          aria-label={`Edit ${member.name}`}
                          onClick={() => openEditModal(member)}
                          style={actionButtonStyle}
                        >
                          {renderActionIcon('edit')}
                        </button>

                        {/* Reset Password */}
                        <button
                          type="button"
                          title="Reset password"
                          aria-label={`Reset password for ${member.name}`}
                          onClick={() => openResetModal(member)}
                          style={actionButtonStyle}
                        >
                          {renderActionIcon('reset')}
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          title="Delete"
                          aria-label={`Delete ${member.name}`}
                          onClick={() => openDeleteModal(member)}
                          style={actionButtonStyle}
                        >
                          {renderActionIcon('delete')}
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

          {/* Footer */}
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

      {/* Add / Edit / Reset / Delete Modals */}
      {modalMode && (
        <div style={overlayStyle}>
          {/* Add Staff Modal */}
          {(modalMode === 'add' || modalMode === 'edit') && (
            <div style={modalStyle}>
              {/* Modal Header */}
              <div style={modalHeaderStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: '#cfe2ff',
                      color: '#0d6efd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {renderStaffIcon()}
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#343a40',
                    }}
                  >
                    {modalMode === 'add'
                      ? 'Add New Staff Account'
                      : 'Edit Staff Account'}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close modal"
                  style={closeButtonStyle}
                >
                  {renderCloseIcon()}
                </button>
              </div>

              {/* Modal Body */}
              <div style={modalBodyStyle}>
                {/* Full Name */}
                <div style={fieldContainerStyle}>
                  <label style={labelStyle}>
                    Full Name <span style={requiredStyle}>*</span>
                  </label>

                  <input
                    type="text"
                    value={formData.name}
                    onChange={(event) =>
                      handleInputChange(
                        'name',
                        event.target.value,
                      )
                    }
                    placeholder="e.g. Juan dela Cruz"
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.name
                        ? '#dc3545'
                        : '#dee2e6',
                    }}
                  />

                  {formErrors.name && (
                    <span style={errorStyle}>
                      {formErrors.name}
                    </span>
                  )}
                </div>

                {/* Username + Role */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: '12px',
                  }}
                >
                  <div style={fieldContainerStyle}>
                    <label style={labelStyle}>
                      Username{' '}
                      <span style={requiredStyle}>*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.username}
                      onChange={(event) =>
                        handleInputChange(
                          'username',
                          event.target.value.replace(/^@/, ''),
                        )
                      }
                      placeholder="e.g. jdelacruz"
                      style={{
                        ...inputStyle,
                        borderColor: formErrors.username
                          ? '#dc3545'
                          : '#dee2e6',
                      }}
                    />

                    {formErrors.username && (
                      <span style={errorStyle}>
                        {formErrors.username}
                      </span>
                    )}
                  </div>

                  <div style={fieldContainerStyle}>
                    <label style={labelStyle}>Role</label>

                    <input
                      type="text"
                      value="Staff"
                      disabled
                      style={{
                        ...inputStyle,
                        backgroundColor: '#f8f9fa',
                        color: '#495057',
                        cursor: 'not-allowed',
                      }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div style={fieldContainerStyle}>
                  <label style={labelStyle}>
                    Email Address{' '}
                    <span style={requiredStyle}>*</span>
                  </label>

                  <input
                    type="email"
                    value={formData.email}
                    onChange={(event) =>
                      handleInputChange(
                        'email',
                        event.target.value,
                      )
                    }
                    placeholder="e.g. juan.delacruz@grocerytrack.com"
                    style={{
                      ...inputStyle,
                      borderColor: formErrors.email
                        ? '#dc3545'
                        : '#dee2e6',
                    }}
                  />

                  {formErrors.email && (
                    <span style={errorStyle}>
                      {formErrors.email}
                    </span>
                  )}
                </div>

                {/* Password */}
                <div style={fieldContainerStyle}>
                  <label style={labelStyle}>
                    {modalMode === 'edit'
                      ? 'Password'
                      : 'Password'}
                    {modalMode === 'add' && (
                      <span style={requiredStyle}> *</span>
                    )}
                  </label>

                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(event) =>
                        handleInputChange(
                          'password',
                          event.target.value,
                        )
                      }
                      placeholder={
                        modalMode === 'edit'
                          ? 'Leave blank to keep current password'
                          : 'Set a password'
                      }
                      style={{
                        ...inputStyle,
                        paddingRight: '42px',
                        borderColor: formErrors.password
                          ? '#dc3545'
                          : '#dee2e6',
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '24px',
                        height: '24px',
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        color: '#adb5bd',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {renderEyeIcon()}
                    </button>
                  </div>

                  {formErrors.password && (
                    <span style={errorStyle}>
                      {formErrors.password}
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveStaff}
                  style={primaryButtonStyle}
                >
                  {modalMode === 'add'
                    ? 'Save Account'
                    : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* Reset Password Modal */}
          {modalMode === 'reset' && selectedStaff && (
            <div style={modalStyle}>
              <div style={modalHeaderStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: '#cfe2ff',
                      color: '#0d6efd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {renderActionIcon('reset')}
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#343a40',
                    }}
                  >
                    Reset Password
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close modal"
                  style={closeButtonStyle}
                >
                  {renderCloseIcon()}
                </button>
              </div>

              <div style={modalBodyStyle}>
                <p
                  style={{
                    margin: '0 0 16px',
                    fontSize: '12px',
                    lineHeight: 1.6,
                    color: '#6c757d',
                  }}
                >
                  Set a new password for{' '}
                  <strong style={{ color: '#495057' }}>
                    {selectedStaff.name}
                  </strong>
                  .
                </p>

                <div style={fieldContainerStyle}>
                  <label style={labelStyle}>
                    New Password{' '}
                    <span style={requiredStyle}>*</span>
                  </label>

                  <div style={{ position: 'relative' }}>
                    <input
                      type={
                        showPassword ? 'text' : 'password'
                      }
                      value={formData.password}
                      onChange={(event) =>
                        handleInputChange(
                          'password',
                          event.target.value,
                        )
                      }
                      placeholder="Enter new password"
                      style={{
                        ...inputStyle,
                        paddingRight: '42px',
                        borderColor: formErrors.password
                          ? '#dc3545'
                          : '#dee2e6',
                      }}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '24px',
                        height: '24px',
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        color: '#adb5bd',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {renderEyeIcon()}
                    </button>
                  </div>

                  {formErrors.password && (
                    <span style={errorStyle}>
                      {formErrors.password}
                    </span>
                  )}
                </div>
              </div>

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleResetPassword}
                  style={primaryButtonStyle}
                >
                  Reset Password
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {modalMode === 'delete' && selectedStaff && (
            <div
              style={{
                ...modalStyle,
                maxWidth: '420px',
              }}
            >
              <div style={modalHeaderStyle}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#343a40',
                  }}
                >
                  Delete Staff Account
                </h3>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close modal"
                  style={closeButtonStyle}
                >
                  {renderCloseIcon()}
                </button>
              </div>

              <div style={modalBodyStyle}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    lineHeight: 1.7,
                    color: '#6c757d',
                  }}
                >
                  Are you sure you want to delete{' '}
                  <strong style={{ color: '#495057' }}>
                    {selectedStaff.name}
                  </strong>
                  &apos;s account? This action cannot be undone.
                </p>
              </div>

              <div style={modalFooterStyle}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={secondaryButtonStyle}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  style={dangerButtonStyle}
                >
                  Delete Account
                </button>
              </div>
            </div>
          )}
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

const tableHeaderStyle: React.CSSProperties = {
  padding: '11px 16px',
  color: '#adb5bd',
  fontSize: '10px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.35px',
  textAlign: 'left',
  whiteSpace: 'nowrap',
}

const tableCellStyle: React.CSSProperties = {
  padding: '11px 16px',
  verticalAlign: 'middle',
}

const actionButtonStyle: React.CSSProperties = {
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

const iconImageStyle: React.CSSProperties = {
  width: '15px',
  height: '15px',
  objectFit: 'contain',
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 1500,
  backgroundColor: 'rgba(33, 37, 41, 0.50)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
}

const modalStyle: React.CSSProperties = {
  width: '100%',
  maxWidth: '385px',
  backgroundColor: '#fff',
  borderRadius: '10px',
  boxShadow: '0 12px 48px rgba(0,0,0,0.18)',
  overflow: 'hidden',
}

const modalHeaderStyle: React.CSSProperties = {
  minHeight: '54px',
  padding: '12px 18px',
  borderBottom: '1px solid #e9ecef',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}

const modalBodyStyle: React.CSSProperties = {
  padding: '18px 18px 8px',
}

const modalFooterStyle: React.CSSProperties = {
  padding: '11px 18px',
  borderTop: '1px solid #e9ecef',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '8px',
}

const fieldContainerStyle: React.CSSProperties = {
  marginBottom: '14px',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '10px',
  fontWeight: 600,
  color: '#495057',
}

const requiredStyle: React.CSSProperties = {
  color: '#dc3545',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: '34px',
  boxSizing: 'border-box',
  padding: '8px 12px',
  border: '1px solid #dee2e6',
  borderRadius: '6px',
  backgroundColor: '#fff',
  color: '#495057',
  fontSize: '11px',
  outline: 'none',
}

const errorStyle: React.CSSProperties = {
  display: 'block',
  marginTop: '4px',
  color: '#dc3545',
  fontSize: '10px',
}

const secondaryButtonStyle: React.CSSProperties = {
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

const primaryButtonStyle: React.CSSProperties = {
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

const dangerButtonStyle: React.CSSProperties = {
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

const closeButtonStyle: React.CSSProperties = {
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