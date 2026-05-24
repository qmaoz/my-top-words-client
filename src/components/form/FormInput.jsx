import { TextField } from '@mui/material';

const FormInput = ({
  name, label, register, errors,
  required = false, fullWidth = false, disabled=false,
  maxLength = null,
  type='text', placeholder = '', className = '', color='primary', autoComplete=''
}) => {
  const validationRules = {
    ...(required && {
      required: 'Поле не може бути порожнім',
      validate: {
        notBlank: (v) => v.trim().length > 0 || 'Поле не може складатися лише з пробілів'
      }
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
      placeholder={placeholder}
      className={className}
      fullWidth={fullWidth}
      color={color}
      disabled={disabled}
      autoComplete={autoComplete}

      variant="outlined"
      margin="normal"
      
      error={Boolean(errors[name])}
      helperText={errors[name]?.message}
    />
  );
};

export default FormInput;