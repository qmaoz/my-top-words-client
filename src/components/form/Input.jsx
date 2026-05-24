import React, { forwardRef } from 'react';

const Input = forwardRef((props, ref) => {
  return (
    <>
      <input
        onChange={props.onChange}
        onBlur={props.onBlur}
        name={props.name}
        ref={ref} // for react-hook-form
        id={props.id}
        type={props.type || 'text'}
        placeholder={props.placeholder}
        className={`form-control ${props.error ? 'is-invalid' : ''}`}
        maxLength={props.maxLength}
        autoComplete="on"
      />
      {props.helperText && (
        <span style={{ color: props.error ? 'red' : 'inherit' }}>
          {props.helperText}
        </span>
      )}
    </>
  );
});

export default Input;