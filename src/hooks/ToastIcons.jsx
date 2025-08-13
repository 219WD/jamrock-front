// ToastIcons.js
import React from 'react';
import '../css/ToastIcons.css'; // Archivo CSS para los estilos de los iconos

export const SuccessIcon = () => (
  <svg
    className="toast-icon success-icon"
    width="40px"
    height="40px"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Success</title>
    <g fill="none" fillRule="evenodd">
      <g className="icon-path" transform="translate(42.666667, 42.666667)">
        <path d="M213.333333,0 C95.51296,0 0,95.51296 0,213.333333 C0,331.153707 95.51296,426.666667 213.333333,426.666667 C331.153707,426.666667 426.666667,331.153707 426.666667,213.333333 C426.666667,95.51296 331.153707,0 213.333333,0 Z M293.669333,137.114453 L323.835947,167.281067 L192,299.66912 L112.916693,220.585813 L143.083307,190.4192 L192,239.335893 L293.669333,137.114453 Z"></path>
      </g>
    </g>
  </svg>
);

export const ErrorIcon = () => (
  <svg
    className="toast-icon error-icon"
    width="40px"
    height="40px"
    viewBox="0 0 512 512"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>Error</title>
    <g fill="none" fillRule="evenodd">
      <g className="icon-path" transform="translate(42.666667, 42.666667)">
        <path d="M213.333333,0 C331.136,0 426.666667,95.5306667 426.666667,213.333333 C426.666667,331.136 331.136,426.666667 213.333333,426.666667 C95.5306667,426.666667 0,331.136 0,213.333333 C0,95.5306667 95.5306667,0 213.333333,0 Z M262.250667,134.250667 L213.333333,183.168 L164.416,134.250667 L134.250667,164.416 L183.168,213.333333 L134.250667,262.250667 L164.416,292.416 L213.333333,243.498667 L262.250667,292.416 L292.416,262.250667 L243.498667,213.333333 L292.416,164.416 L262.250667,134.250667 Z"></path>
      </g>
    </g>
  </svg>
);