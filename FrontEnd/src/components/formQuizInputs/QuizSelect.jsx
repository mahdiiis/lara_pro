import { useId } from "react"
import PropTypes from "prop-types"

export function Select ({ name,label, value, onChange,icon:Icon ,placeholder ,levels}) {
    const id = useId()
    return (
        <div className="group">
            <label htmlFor={id} className="form-label flex items-center gap-2">
                <Icon className="text-purple-main" size={18} />
                {label}
            </label>
            <select
                className="input-field"
                name={name} 
                value={value}
                id={id}
                onChange={onChange}
                // placeholder={placeholder}
            >
            {levels.map(num=>(
                <option key={num} value={num}>{num}</option>
            ))}
            </select>
        </div>
    )
}

Select.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    levels: PropTypes.arrayOf(PropTypes.number).isRequired,
    icon: PropTypes.elementType.isRequired
}