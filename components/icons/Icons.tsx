import React from 'react';

export const GraduationCap: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M22 9l-10 5-10-5" />
    <path d="M6 12v5c0 3.31 2.69 6 6 6s6-2.69 6-6v-5" />
  </svg>
);


export const Wallet: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14" />
    <path d="M22 7H10" />
  </svg>
);

export const SearchCheck: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
    <path d="M8 11l2 2 4-4" />
  </svg>
);


export const Download: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const QrCode: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="3" y="3" width="6" height="6" />
    <rect x="15" y="3" width="6" height="6" />
    <rect x="3" y="15" width="6" height="6" />
    <path d="M15 15h6v6h-6z" />
  </svg>
);


export const QrCodeScan: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
  </svg>
);

export const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const UploadCloud: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M20 16.2A4.5 4.5 0 0 0 15.5 14H14.71A6.995 6.995 0 0 0 3 15.1" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);


export const FileText: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <line x1="10" y1="9" x2="8" y2="9" />
  </svg>
);

export const GitBranch: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
);

export const Copy: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

export const WalletConnect: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg width="24" height="24" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M30.4167 15.8333C30.4167 15.2051 30.9218 14.6667 31.5833 14.6667C32.2449 14.6667 32.75 15.2051 32.75 15.8333V24.1667C32.75 24.7949 32.2449 25.3333 31.5833 25.3333C30.9218 25.3333 30.4167 24.7949 30.4167 24.1667V15.8333Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M7.25 15.8333C7.25 15.2051 7.75508 14.6667 8.41667 14.6667C9.07825 14.6667 9.58333 15.2051 9.58333 15.8333V24.1667C9.58333 24.7949 9.07825 25.3333 8.41667 25.3333C7.75508 25.3333 7.25 24.7949 7.25 24.1667V15.8333Z" fill="currentColor"/>
      <path d="M23.1667 9.58334C23.1667 8.92176 22.6616 8.41667 22 8.41667C21.3384 8.41667 20.8333 8.92176 20.8333 9.58334V30.4167C20.8333 31.0783 21.3384 31.5833 22 31.5833C22.6616 31.5833 23.1667 31.0783 23.1667 30.4167V9.58334Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M16.8333 9.58334C16.8333 8.92176 17.3384 8.41667 18 8.41667C18.6616 8.41667 19.1667 8.92176 19.1667 9.58334V30.4167C19.1667 31.0783 18.6616 31.5833 18 31.5833C17.3384 31.5833 16.8333 31.0783 16.8333 30.4167V9.58334Z" fill="currentColor"/>
      <path d="M12.75 14.6667C12.0884 14.6667 11.5833 15.2051 11.5833 15.8333V24.1667C11.5833 24.7949 12.0884 25.3333 12.75 25.3333C13.4116 25.3333 13.9167 24.7949 13.9167 24.1667V15.8333C13.9167 15.2051 13.4116 14.6667 12.75 14.6667Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M26.0833 14.6667C25.4218 14.6667 24.9167 15.2051 24.9167 15.8333V24.1667C24.9167 24.7949 25.4218 25.3333 26.0833 25.3333C26.7449 25.3333 27.25 24.7949 27.25 24.1667V15.8333C27.25 15.2051 26.7449 14.6667 26.0833 14.6667Z" fill="currentColor"/>
    </svg>
);