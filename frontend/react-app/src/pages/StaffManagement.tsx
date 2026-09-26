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

function StaffManagement() {
  const [staff, setStaff] = useState<Staff[]>(initialStaff)
  const [search, setSearch] = useState('')
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null)
  const [actionType, setActionType] = useState<ActionType>(null)

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

  const openConfirmation = (member: Staff, action: ActionType) => {
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
      setStaff((currentStaff) =>
        currentStaff.filter((member) => member.id !== selectedStaff.id),
      )
    }

    if (actionType === 'deactivate') {
      setStaff((currentStaff) =>
        currentStaff.map((member) =>
          member.id === selectedStaff.id
            ? { ...member, status: 'Inactive' }
            : member,
        ),
      )
    }

    if (actionType === 'activate') {
      setStaff((currentStaff) =>
        currentStaff.map((member) =>
          member.id === selectedStaff.id
            ? { ...member, status: 'Active' }
            : member,
        ),
      )
    }

    closeConfirmation()
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

  const getConfirmButtonClass = () => {
    if (actionType === 'activate') {
      return 'btn btn-success'
    }

    return 'btn btn-danger'
  }

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 56px)',
        backgroundColor: '#f0f2f5',
        margin: '-24px',
        padding: '24px 28px',
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Page Header */}
      <div
        className="d-flex justify-content-between align-items-start"
        style={{ marginBottom: '20px' }}
      >
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 600,
              color: '#343a40',
              marginBottom: '6px',
            }}
          >
            Manage Staff Accounts
          </h2>

          <div
            style={{
              fontSize: '13px',
              color: '#adb5bd',
            }}
          >
            {staff.length} total accounts{' '}
            <span style={{ margin: '0 5px' }}>•</span>
            <span style={{ color: '#198754' }}>{activeCount} active</span>
          </div>
        </div>

        {/* Visual button only - Add Staff functionality belongs to another task */}
        <button
          type="button"
          className="btn"
          style={{
            backgroundColor: '#0d6efd',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <span style={{ fontSize: '16px', marginRight: '6px' }}>+</span>
          Add New Staff
        </button>
      </div>

      {/* Search Card */}
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e9ecef',
          borderRadius: '10px',
          padding: '14px 14px',
          marginBottom: '14px',
        }}
      >
        <div className="d-flex align-items-center">
          <div style={{ position: 'relative', flex: 1 }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#adb5bd',
                fontSize: '15px',
                pointerEvents: 'none',
              }}
            >
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, username, or email..."
              className="form-control"
              style={{
                height: '36px',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                paddingLeft: '34px',
                fontSize: '12px',
                color: '#495057',
              }}
            />
          </div>

          <span
            style={{
              marginLeft: '12px',
              color: '#adb5bd',
              fontSize: '12px',
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
        <div className="table-responsive">
          <table
            className="table mb-0"
            style={{
              fontSize: '13px',
              color: '#343a40',
              minWidth: '850px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#f8f9fa',
                  borderBottom: '1px solid #e9ecef',
                }}
              >
                <th
                  style={{
                    padding: '11px 16px',
                    color: '#adb5bd',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  Full Name
                </th>

                <th
                  style={{
                    padding: '11px 16px',
                    color: '#adb5bd',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  Username / Email
                </th>

                <th
                  style={{
                    padding: '11px 16px',
                    color: '#adb5bd',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  Role
                </th>

                <th
                  style={{
                    padding: '11px 16px',
                    color: '#adb5bd',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  Status
                </th>

                <th
                  style={{
                    padding: '11px 16px',
                    color: '#adb5bd',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                  }}
                >
                  Date Joined
                </th>

                <th
                  style={{
                    padding: '11px 16px',
                    color: '#adb5bd',
                    fontSize: '11px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.3px',
                    textAlign: 'center',
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredStaff.map((member) => (
                <tr
                  key={member.id}
                  style={{
                    borderBottom: '1px solid #f1f3f5',
                  }}
                >
                  {/* Full Name */}
                  <td style={{ padding: '11px 16px' }}>
                    <div className="d-flex align-items-center">
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '50%',
                          backgroundColor:
                            member.id % 3 === 0
                              ? '#20c997'
                              : member.id % 3 === 1
                                ? '#198754'
                                : '#7950f2',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          fontWeight: 600,
                          marginRight: '10px',
                          flexShrink: 0,
                        }}
                      >
                        {member.initials}
                      </div>

                      <span
                        style={{
                          fontWeight: 500,
                          color: '#343a40',
                        }}
                      >
                        {member.name}
                      </span>
                    </div>
                  </td>

                  {/* Username / Email */}
                  <td style={{ padding: '11px 16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#495057',
                        marginBottom: '2px',
                      }}
                    >
                      {member.username}
                    </div>

                    <div
                      style={{
                        fontSize: '11px',
                        color: '#adb5bd',
                      }}
                    >
                      {member.email}
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '11px 16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor:
                          member.role === 'Cashier' ? '#cfe2ff' : '#e9ecef',
                        color:
                          member.role === 'Cashier' ? '#0b5ed7' : '#495057',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {member.role}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '11px 16px' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 9px',
                        borderRadius: '4px',
                        backgroundColor:
                          member.status === 'Active' ? '#d1e7dd' : '#e9ecef',
                        color:
                          member.status === 'Active' ? '#146c43' : '#6c757d',
                        fontSize: '11px',
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
                      padding: '11px 16px',
                      color: '#adb5bd',
                      fontSize: '11px',
                    }}
                  >
                    {member.dateJoined}
                  </td>

                  {/* Actions */}
                  <td
                    style={{
                      padding: '11px 16px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      className="d-flex justify-content-center"
                      style={{ gap: '5px' }}
                    >
                      {/* Edit - visual only, belongs to another task */}
                      <button
                        type="button"
                        title="Edit"
                        style={{
                          width: '28px',
                          height: '28px',
                          border: '1px solid #dee2e6',
                          backgroundColor: '#fff',
                          borderRadius: '5px',
                          color: '#6c757d',
                          fontSize: '13px',
                        }}
                      >
                        ✎
                      </button>

                      {/* Activate / Deactivate */}
                      <button
                        type="button"
                        title={
                          member.status === 'Active'
                            ? 'Deactivate'
                            : 'Activate'
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
                          width: '28px',
                          height: '28px',
                          border: '1px solid #dee2e6',
                          backgroundColor: '#fff',
                          borderRadius: '5px',
                          color:
                            member.status === 'Active'
                              ? '#6c757d'
                              : '#198754',
                          fontSize: '13px',
                        }}
                      >
                        {member.status === 'Active' ? '♙' : '✓'}
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => openConfirmation(member, 'delete')}
                        style={{
                          width: '28px',
                          height: '28px',
                          border: '1px solid #dee2e6',
                          backgroundColor: '#fff',
                          borderRadius: '5px',
                          color: '#6c757d',
                          fontSize: '13px',
                        }}
                      >
                        ♧
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
                      textAlign: 'center',
                      padding: '40px',
                      color: '#adb5bd',
                      fontSize: '13px',
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
            padding: '10px 16px',
            borderTop: '1px solid #e9ecef',
            color: '#adb5bd',
            fontSize: '11px',
          }}
        >
          Showing {filteredStaff.length} of {staff.length} accounts
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedStaff && actionType && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1050,
            padding: '20px',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '430px',
              backgroundColor: '#fff',
              borderRadius: '10px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid #e9ecef',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h5
                style={{
                  margin: 0,
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#343a40',
                }}
              >
                {getModalTitle()}
              </h5>

              <button
                type="button"
                onClick={closeConfirmation}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: '#adb5bd',
                  fontSize: '20px',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div
              style={{
                padding: '20px',
                fontSize: '13px',
                lineHeight: 1.6,
                color: '#6c757d',
              }}
            >
              {getModalMessage()}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 20px',
                borderTop: '1px solid #e9ecef',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px',
              }}
            >
              <button
                type="button"
                className="btn btn-light"
                onClick={closeConfirmation}
                style={{
                  border: '1px solid #dee2e6',
                  fontSize: '12px',
                  padding: '7px 16px',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className={getConfirmButtonClass()}
                onClick={confirmAction}
                style={{
                  fontSize: '12px',
                  padding: '7px 16px',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffManagement