import { useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";


interface Props{
    value?: string,
    onPickerChange: (color:string) => void;
}
const ColorPicker = ({value,onPickerChange}:Props) => {
  return(
    <div className="relative">
        <div className="flex flex-row items-center gap-1">
            <p className="text-gray-600 ml-2">#</p>
        <HexColorInput color={value} onChange={onPickerChange} className="hex-input" />
        </div>
         <HexColorPicker color={value} onChange={onPickerChange}/>
    </div>
)};

export default ColorPicker;