interface Props {
  option: string
  onClick: () => void
  state: "default" | "correct" | "wrong"
}

export default function OptionButton({
  option,
  onClick,
  state,
}: Props) {
  const getClass = () => {
    switch (state) {
      case "correct":
        return "bg-green-500 text-white border-green-500"

      case "wrong":
        return "bg-red-500 text-white border-red-500"

      default:
        return "text-black border-gray-300"
    }
  }

  return (
    <button
      onClick={onClick}
      className={`
        lg:w-[40vw]
        w-[80vw]
        lg:text-4xl
        text-7xl 
        rounded-2xl
        border
        p-4
        font-medium
        transition-all
        active:scale-[0.98]
        ${getClass()}
      `}
    >
      {option}
    </button>
  )
}