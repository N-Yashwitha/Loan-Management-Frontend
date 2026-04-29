export default function AuthForm({
  title,
  description,
  fields,
  formData,
  onChange,
  onSubmit,
  submitLabel,
  footer
}) {
  return (
    <div className="card auth-card">
      <div className="section-heading">
        <span className="section-badge">Loaniverse</span>
        <h2>{title}</h2>
        {description ? <p className="muted">{description}</p> : null}
      </div>
      <form onSubmit={onSubmit} className="form-grid">
        {fields.map((field) => (
          <label key={field.name} className="form-field">
            <span>{field.label}</span>
            {field.type === "select" ? (
              <select
                name={field.name}
                value={formData[field.name] || ""}
                onChange={onChange}
                required={field.required}
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={onChange}
                required={field.required}
                placeholder={field.placeholder}
              />
            )}
          </label>
        ))}
        <button type="submit" className="primary-btn">
          {submitLabel}
        </button>
      </form>
      <p className="auth-footer">{footer}</p>
    </div>
  );
}
