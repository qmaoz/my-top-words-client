import { TextField } from '@mui/material';

const FormInput = ({
  name, label, register, errors,
  required = false, fullWidth = false, disabled = false,
  maxLength = null,
  type = 'text', placeholder = '', className = '', color = 'primary', autoComplete = ''
}) => {
  const validationRules = {
    ...(required && {
      required: label ? `«${label}» не може бути порожнім` : 'Поле не може бути порожнім',
      validate: {
        notBlank: (v) => (
          v.trim().length > 0
          || (label ? `«${label}» не може складатися лише з пробілів` : 'Поле не може складатися лише з пробілів')
        ),
      },
    }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: `Максимальна довжина — ${maxLength}`
      }
    })
  };

  return (
    <TextField
      {...register(name, validationRules)}
      id={name}
      label={label}
      type={type}
      placeholder={placeholder ? placeholder : undefined}
      className={className}
      fullWidth={fullWidth}
      color={color}
      disabled={disabled}
      autoComplete={autoComplete ? autoComplete : undefined}

      variant="outlined"
      margin="dense"
      size="small"
      
      error={Boolean(errors[name])}
      helperText={errors[name]?.message}
    />
  );
};

export default FormInput;