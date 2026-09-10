import { TextField } from '@mui/material';
import { useTranslation } from 'react-i18next';

const FormInput = ({
  name, label, register, errors,
  required = false, fullWidth = false, disabled = false,
  maxLength = null,
  type = 'text', placeholder = '', className = '', color = 'primary', autoComplete = 'off'
}) => {
  const { t } = useTranslation();

  const validationRules = {
    ...(required && {
      required: label ? t('validation.emptyNamed', { label }) : t('validation.empty'),
      validate: {
        notBlank: (v) => (
          v.trim().length > 0
          || (label ? t('validation.whitespaceNamed', { label }) : t('validation.whitespace'))
        ),
      },
    }),
    ...(maxLength && {
      maxLength: {
        value: maxLength,
        message: t('validation.maxLength', { max: maxLength }),
      },
    }),
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
      autoComplete={autoComplete}

      variant="outlined"
      margin="none"
      size="small"
      
      error={Boolean(errors[name])}
      helperText={errors[name]?.message}
    />
  );
};

export default FormInput;
