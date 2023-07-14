const ErrorField = ({ message }: ErrorFieldProps) => {
  if (!message) return null;

  return <div className="error">{message}</div>;
};

export default ErrorField;
