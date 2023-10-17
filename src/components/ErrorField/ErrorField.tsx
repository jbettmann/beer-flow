const ErrorField = ({ message }: ErrorFieldProps) => {
  if (!message) return null;

  return <div className="error pl-4">{message}</div>;
};

export default ErrorField;
