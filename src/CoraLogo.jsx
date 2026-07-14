export default function CoraLogo({ size = 56 }) {
  return (
    <svg
      width={size}
      height={size * 1.35}
      viewBox="0 0 100 135"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Cora"
    >
      {/* Pin shadow/outline */}
      <path
        d="M50 4C26.8 4 8 22.8 8 46C8 72 50 131 50 131C50 131 92 72 92 46C92 22.8 73.2 4 50 4Z"
        fill="white"
        opacity="0.6"
      />
      {/* Pin body — bege */}
      <path
        d="M50 8C29 8 12 25 12 46C12 70 50 126 50 126C50 126 88 70 88 46C88 25 71 8 50 8Z"
        fill="#F5E0C8"
      />

      {/* Swirl coral — C grande externa */}
      <path
        d="M57 18
           C72 20 82 32 80 48
           C79 57 73 64 65 68
           C60 70 55 70 51 68
           C47 66 44 62 44 57
           C44 51 49 47 55 47
           C59 47 62 50 62 54
           C62 57 60 59 57 59
           C54 59 52 57 53 55"
        stroke="#E97B73"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />

      {/* Swirl verde-sálvia — C interna */}
      <path
        d="M44 28
           C36 31 30 39 31 48
           C32 55 38 61 45 62
           C49 63 52 61 53 58
           C54 55 52 52 49 52
           C47 52 45 54 46 56"
        stroke="#7DB89B"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />

      {/* Dot decorativo coral no topo */}
      <circle cx="57" cy="19" r="4" fill="#E97B73" />
    </svg>
  )
}
