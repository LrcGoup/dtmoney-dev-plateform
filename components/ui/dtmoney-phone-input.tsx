'use client'

import { PhoneInput, type PhoneInputResponseType } from 'react-simple-phone-input'
import 'react-simple-phone-input/dist/index.css'

type DtmoneyPhoneInputProps = {
  value: string
  onChange: (phone: string) => void
  onBlur?: () => void
  id?: string
  disabled?: boolean
}

export function DtmoneyPhoneInput({ value, onChange, onBlur, id, disabled }: DtmoneyPhoneInputProps) {
  function handleChange(data: PhoneInputResponseType) {
    onChange(data.value || '')
  }

  return (
    <div className="dtmoney-phone-input">
      <PhoneInput
        country="CG"
        preferredCountries={['CG', 'CD', 'FR', 'CM', 'GA']}
        placeholder="06 123 4567"
        value={value}
        disableInput={disabled}
        dialCodeInputField={false}
        searchPlaceholder="Rechercher un pays…"
        searchNotFound="Aucun pays trouvé"
        onChange={handleChange}
        inputProps={{
          id,
          name: 'phone',
          required: true,
          onBlur,
          autoComplete: 'tel',
        }}
        containerClass="w-full"
      />
    </div>
  )
}
