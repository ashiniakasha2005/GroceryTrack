import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

type StaffStatus = "active" | "inactive";

export type StaffMember = {
  id: string;
  fullName: string;
  username: string;
  email: string;
  status?: StaffStatus;
};

type FormValues = {
  fullName: string;
  username: string;
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type StaffFormProps = {
  mode: "add" | "edit";
  staff?: StaffMember;
  isSubmitting?: boolean;
  canManageStaff?: boolean;
  existingUsernames?: string[];
  existingEmails?: string[];
  onClose: () => void;
  onSubmit: (
    values: Omit<FormValues, "password"> & {
      password?: string;
      role: "Staff";
      id?: string;
    }
  ) => Promise<void> | void;
};

const emptyValues: FormValues = {
  fullName: "",
  username: "",
  email: "",
  password: "",
};

function getInitialValues(
  mode: StaffFormProps["mode"],
  staff?: StaffMember
): FormValues {
  if (mode === "edit" && staff) {
    return {
      fullName: staff.fullName,
      username: staff.username,
      email: staff.email,
      password: "",
    };
  }

  return { ...emptyValues };
}

function validate(
  values: FormValues,
  mode: StaffFormProps["mode"]
): FormErrors {
  const errors: FormErrors = {};

  const fullName = values.fullName.trim();
  const username = values.username.trim();
  const email = values.email.trim();

  // Full name validation
  if (!fullName) {
    errors.fullName = "Full name is required.";
  } else if (fullName.length < 2) {
    errors.fullName = "Enter at least 2 characters.";
  }

  // Username validation
  if (!username) {
    errors.username = "Username is required.";
  } else if (
    !/^(?=.{4,20}$)[A-Za-z][A-Za-z0-9]*(?:[._-][A-Za-z0-9]+)*$/.test(
      username
    )
  ) {
    errors.username =
      "Username must be 4–20 characters and start with a letter.";
  }

  // Email validation
  const emailRegex =
    /^[^\s@]+@(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,}$/;

  if (!email) {
    errors.email = "Email address is required.";
  } else if (!emailRegex.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  // Password validation
  // Required only when adding a new staff account.
  // In edit mode, an empty password means keep the current password.
  if (mode === "add" && !values.password) {
    errors.password = "Password is required.";
  } else if (
    values.password &&
    !/^(?=.*\d).{8,}$/.test(values.password)
  ) {
    errors.password =
      "Password must be at least 8 characters and contain a number.";
  }

  return errors;
}

export function StaffForm({
  mode,
  staff,
  isSubmitting = false,
  canManageStaff = true,
  existingUsernames = [],
  existingEmails = [],
  onClose,
  onSubmit,
}: StaffFormProps) {
  const [values, setValues] = useState<FormValues>(() =>
    getInitialValues(mode, staff)
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof FormValues, boolean>>
  >({});

  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const dialogNode = dialogRef.current;
    const focusable = dialogNode?.querySelectorAll<HTMLElement>(
      'button, input, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmitting) {
        onClose();
        return;
      }

      if (event.key === "Tab" && dialogNode) {
        const focusableEls = dialogNode.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [href], select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusableEls.length === 0) return;

        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setValues(getInitialValues(mode, staff));
    setErrors({});
    setTouched({});
    setShowPassword(false);
    setSuccessMessage("");
    setFormError("");
  }, [mode, staff?.id, staff?.fullName, staff?.username, staff?.email]);

  useEffect(() => {
  const fontId = "staff-form-inter-font";

  if (!document.getElementById(fontId)) {
    const link = document.createElement("link");
    link.id = fontId;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";

    document.head.appendChild(link);
  }
}, []);

  function updateField(field: keyof FormValues, value: string) {
    setFormError("");
    setSuccessMessage("");

    const nextValues = {
      ...values,
      [field]: value,
    };

    setValues(nextValues);

    if (touched[field]) {
      setErrors(validate(nextValues, mode));
    }
  }

  // Validate current form values on blur.
  // onChange updates values immediately, so no separate latestValue is needed.
  function handleBlur(field: keyof FormValues) {
    const nextTouched = {
      ...touched,
      [field]: true,
    };

    setTouched(nextTouched);
    setErrors(validate(values, mode));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const nextErrors = validate(values, mode);

    const normalizedUsername = values.username.trim().toLowerCase();
    const normalizedEmail = values.email.trim().toLowerCase();

    // Check duplicate username.
    // In edit mode, the current staff member's existing username is allowed.
    const currentUsername = staff?.username.trim().toLowerCase();
    const usernameIsDuplicate = existingUsernames.some(
      (username) => username.trim().toLowerCase() === normalizedUsername
    );

    if (
      usernameIsDuplicate &&
      !(mode === "edit" && currentUsername === normalizedUsername)
    ) {
      nextErrors.username = "Username already in use.";
    }

    // Check duplicate email.
    // In edit mode, the current staff member's existing email is allowed.
    const currentEmail = staff?.email.trim().toLowerCase();
    const emailIsDuplicate = existingEmails.some(
      (email) => email.trim().toLowerCase() === normalizedEmail
    );

    if (
      emailIsDuplicate &&
      !(mode === "edit" && currentEmail === normalizedEmail)
    ) {
      nextErrors.email = "Email already in use.";
    }

    setErrors(nextErrors);

    setTouched({
      fullName: true,
      username: true,
      email: true,
      password: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      const { password, ...rest } = values;

      const payload = {
        ...rest,
        fullName: rest.fullName.trim(),
        username: rest.username.trim(),
        email: normalizedEmail,
        role: "Staff" as const,
        ...(mode === "edit" && staff ? { id: staff.id } : {}),
        ...(mode === "edit" && !password ? {} : { password }),
      };

      await onSubmit(payload);

      if (mode === "add") {
        setValues({ ...emptyValues });
      }
      setErrors({});
      setTouched({});
      setShowPassword(false);

      setSuccessMessage(
        mode === "add"
          ? "Staff account created."
          : "Staff account updated."
      );
    } catch (err: unknown) {
      // Expects the backend integration to reject with a structured error,
      // e.g. { field: "username" | "email", message: string } for 409s.
      const apiError =
        typeof err === "object" && err !== null
          ? (err as { field?: string; message?: string })
          : undefined;

      if (apiError?.field === "username" || apiError?.field === "email") {
        setErrors((prev) => ({
          ...prev,
          [apiError.field as "username" | "email"]:
            apiError.message ?? "This value is already in use.",
        }));
        setTouched((prev) => ({
          ...prev,
          [apiError.field as "username" | "email"]: true,
        }));
      } else {
        setFormError(
          apiError?.message ?? "Something went wrong. Please try again."
        );
      }
    }
  }

  if (!canManageStaff) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#212529]/50 p-4">
        <section className="w-[420px] max-w-[calc(100vw-32px)] rounded-[10px] bg-white p-6 text-center shadow-[0_12px_48px_rgba(0,0,0,0.18)]">
          <p className="text-[13px] text-[#dc3545]">
            Only Admin users can manage staff accounts.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-4 rounded-[6px] border border-[#dee2e6] px-4 py-2 text-[12px]"
          >
            Close
          </button>
        </section>
      </div>
    );
  }

  function fieldClass(field: keyof FormValues) {
    return [
      "h-[38px] w-full rounded-[6px] border bg-white px-3 text-[13px] font-normal leading-none text-[#343a40] antialiased outline-none transition",
      "placeholder:text-[#343a40] placeholder:opacity-50",
      "focus:border-[#0d6efd] focus:ring-2 focus:ring-[#cfe2ff]",
      errors[field] && touched[field]
        ? "border-[#dc3545] focus:border-[#dc3545] focus:ring-[#f8d7da]"
        : "border-[#dee2e6]",
    ].join(" ");
  }

  function errorId(field: keyof FormValues) {
    return `${titleId}-${field}-error`;
  }

  return (
    <div
       className="fixed inset-0 z-50 flex items-center justify-center bg-[#212529]/50 p-4 font-['Inter']"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="flex min-h-[489px] w-[500px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_12px_48px_rgba(0,0,0,0.18)]"
      >
        {/* Header */}
        <header className="flex h-[69px] items-center justify-between border-b border-[#e9ecef] px-6">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cfe2ff] text-[#084298]"
              aria-hidden="true"
            >
              <UsersIcon />
            </div>

            <h2
              id={titleId}
              className="text-[16px] font-bold leading-6 text-[#343a40]"
            >
              {mode === "add"
                ? "Add New Staff Account"
                : "Edit Staff Account"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="rounded p-1 text-[#adb5bd] transition hover:bg-[#f8f9fa] hover:text-[#495057] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CloseIcon />
          </button>
        </header>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          aria-describedby={formError ? `${titleId}-form-error` : undefined}
          className="flex flex-1 flex-col"
        >
          <div className="flex-1 space-y-4 px-6 py-[22px]">
            {successMessage && (
              <p
                className="rounded-[6px] bg-[#d1e7dd] px-3 py-2 text-center text-[12px] font-medium text-[#0a3622]"
                role="status"
              >
                {successMessage}
              </p>
            )}

            {formError && (
              <p
                id={`${titleId}-form-error`}
                className="flex items-start gap-1 rounded-[6px] bg-[#f8d7da] px-3 py-2 text-[12px] font-medium text-[#842029]"
                role="alert"
              >
                <AlertIcon />
                {formError}
              </p>
            )}

            {/* Full Name */}
            <Field
              id={`${titleId}-full-name`}
              name="staff-full-name"
              label="Full Name"
              required
              disabled={isSubmitting}
              value={values.fullName}
              placeholder="e.g. Juan dela Cruz"
              error={touched.fullName ? errors.fullName : undefined}
              errorId={errorId("fullName")}
              inputClassName={fieldClass("fullName")}
              onChange={(value) => updateField("fullName", value)}
              onBlur={() => handleBlur("fullName")}
            />

            {/* Username and Role */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                id={`${titleId}-username`}
                name="staff-username"
                label="Username"
                required
                disabled={isSubmitting}
                value={values.username}
                placeholder="e.g. j.delacruz"
                error={touched.username ? errors.username : undefined}
                errorId={errorId("username")}
                inputClassName={fieldClass("username")}
                onChange={(value) => updateField("username", value)}
                onBlur={() => handleBlur("username")}
              />

              <div>
                <label
                  htmlFor={`${titleId}-role`}
                  className="mb-[5px] block text-left text-[12px] font-semibold leading-[18px] text-[#495057]"
                >
                  Role
                </label>

                <input
                  id={`${titleId}-role`}
                  name="role"
                  value="Staff"
                  readOnly
                  disabled
                  className="h-[38px] w-full cursor-not-allowed rounded-[6px] border border-[#dee2e6] bg-[#f8f9fa] px-3 text-[13px] font-['Inter'] leading-none text-[#343a40] opacity-100"         
                />
              </div>
            </div>

            {/* Email */}
            <Field
              id={`${titleId}-email`}
              name="staff-email"
              label="Email Address"
              required
              disabled={isSubmitting}
              type="email"
              value={values.email}
              placeholder="e.g. juan.delacruz@grocerytrack.com"
              error={touched.email ? errors.email : undefined}
              errorId={errorId("email")}
              inputClassName={fieldClass("email")}
              onChange={(value) => updateField("email", value)}
              onBlur={() => handleBlur("email")}
            />

            {/* Password */}
            <div>
              <label
                htmlFor={`${titleId}-password`}
                className="mb-[5px] block text-left text-[12px] font-semibold leading-[18px] text-[#495057]"
              >
                Password{" "}
                {mode === "add" && (
                  <span className="text-[#dc3545]">*</span>
                )}
              </label>

              <div className="relative">
                <input
                  id={`${titleId}-password`}
                  name="staff-password-field"
                  type={showPassword ? "text" : "password"}
                  value={values.password}
                  required={mode === "add"}
                  disabled={isSubmitting}
                  placeholder={
                    mode === "add"
                      ? "Set a password"
                      : "Leave blank to keep current password"
                  }
                  autoComplete="off"
                  aria-invalid={Boolean(
                    touched.password && errors.password
                  )}
                  aria-describedby={
                    touched.password && errors.password
                      ? errorId("password")
                      : undefined
                  }
                  className={`${fieldClass("password")} pr-10`}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  onBlur={() => handleBlur("password")}
                />

                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() =>
                    setShowPassword((visible) => !visible)
                  }
                  disabled={isSubmitting}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[#adb5bd] transition hover:text-[#495057] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>

              {touched.password && errors.password && (
                <p
                  id={errorId("password")}
                  className="mt-1 flex items-start gap-1 text-[12px] leading-4 text-[#dc3545]"
                  role="alert"
                >
                  <AlertIcon />
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-auto flex h-[66px] items-center justify-end gap-[10px] border-t border-[#e9ecef] px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex h-[38px] items-center justify-center rounded-[6px] border border-[#dee2e6] bg-white px-5 text-center font-[Inter] text-[13px] font-medium leading-[19.5px] tracking-normal text-[#495057] antialiased transition hover:bg-[#f8f9fa] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

           <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-[37.1px] w-[131px] shrink-0 items-center justify-center whitespace-nowrap rounded-[6px] bg-[#0d6efd] px-[22px] py-0 text-center font-['Inter'] text-[13px] font-semibold leading-[19.5px] tracking-[0px] text-white transition hover:bg-[#0b5ed7] disabled:cursor-not-allowed disabled:opacity-60"
            >
            {isSubmitting
                ? "Saving…"
                : mode === "add"
                ? "Save Account"
                : "Save Changes"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  value: string;
  placeholder: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  autoComplete?: string;
  error?: string;
  errorId: string;
  inputClassName: string;
  onChange: (value: string) => void;
  onBlur: () => void;
};

function Field({
  id,
  name,
  label,
  value,
  placeholder,
  type = "text",
  required,
  disabled,
  autoComplete = "off",
  error,
  errorId,
  inputClassName,
  onChange,
  onBlur,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-[5px] block text-left text-[12px] font-semibold leading-[18px] text-[#495057]"
      >
        {label}{" "}
        {required && <span className="text-[#dc3545]">*</span>}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={inputClassName}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />

      {error && (
        <p
          id={errorId}
          className="mt-1 flex items-start gap-1 text-[12px] leading-4 text-[#dc3545]"
          role="alert"
        >
          <AlertIcon />
          {error}
        </p>
      )}
    </div>
  );
}

function UsersIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0"
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-3.1 4.3M6.6 6.6C3.7 8.6 2 12 2 12s3.5 8 10 8a9.8 9.8 0 0 0 3.4-.6" />
    </svg>
  );
}