import React, { forwardRef } from 'react';
import { useState } from 'react';

const PasswordInput = forwardRef((props, ref) => {
  const [type, setType] = useState(props.type || 'password');
  
  function onEyeClick(e) {
    const el = e.target;
    e.preventDefault();
  
    let password = el.closest('.toggle-container').querySelector('.pswd');
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    setType(type);
    e.target.classList.toggle('fa-eye-slash');
    e.target.classList.toggle('fa-eye');
  }

  return (
    <>
      <div className="toggle-container">
        <input
          onChange={props.onChange}
          onBlur={props.onBlur}
          name={props.name}
          ref={ref} // for react-hook-form
          type={type}
          id={props.id}
          maxLength={props.maxLength}
          className="form-control pswd"
          placeholder={props.placeholder}
          autoComplete="on"
        />
        <i className="fa fa-eye-slash togglePassword" onClick={(e) => {onEyeClick(e);}}></i>
      </div>
      {props.helperText && (
        <span style={{ color: props.error ? 'red' : 'inherit' }}>
          {props.helperText}
        </span>
      )}
    </>
  );
});

export default PasswordInput;
