import {clsx} from 'clsx'

interface InputProps {

    className?: string
    labelStyle?: string
    InputStyle?: string
    labelName: string
    isRequired: boolean
    inputName: string
    inputId: string
    inputType: string
    InputPlacholder: string
    disabled?: boolean
    inputValue?: string
    onChange?: (e: React.FormEvent<HTMLInputElement>) => void
    errorMessage?: string
    errorMessageStyle?: string 
}



export const Input = ({labelStyle,disabled,InputStyle,onChange,inputValue, labelName, isRequired, inputName, inputId, inputType, InputPlacholder}: InputProps) => {
  return (
    <div className="w-full">
    <label htmlFor={inputId} className={clsx('text-xs text-white mb-2 block', labelStyle)}>{labelName}</label>
    <input value={inputValue} onChange={onChange} disabled={disabled} name={inputName} required={isRequired} id={inputId} type={inputType} placeholder={InputPlacholder} className={clsx('bg-black1 text-xs rounded border border-black2 w-full py-2.5 px-3 placeholder:text-gray1 text-white', InputStyle)} />
    </div>
  )
}
