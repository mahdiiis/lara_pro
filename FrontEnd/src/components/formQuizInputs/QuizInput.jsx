import { useId } from "react"
import PropTypes from "prop-types"

export function Input ({ name,label, value, onChange ,icon: Icon,placeholder ,type='text' }) {
    const id = useId()
    return (
        <div className="group">
            <label htmlFor={id} className="form-label flex items-center gap-2">
                <Icon className="text-purple-main" size={18} />
                    {label}
            </label>
            <input 
                className="input-field"
                type={type}
                name={name}
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
            />
        </div>
    )
}

Input.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    type: PropTypes.string,
    required: PropTypes.bool,
    icon: PropTypes.elementType,
}