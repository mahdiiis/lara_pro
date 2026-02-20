import { useLanguage } from "../../hooks/useLanguage";
import { Package  ,Layers } from "lucide-react";

export function Box_Bal({ levelType, handleLevelTypeChange ,curretnLevelType }) {
    const { t } = useLanguage();
    
    const isBox = levelType === "box";
    const isActive = curretnLevelType === levelType;

    return(<>
        <button
            onClick={() => handleLevelTypeChange(levelType)}
            className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            isActive 
            ? isBox 
                ? "bg-gradient-to-r from-purple-deep to-purple-main text-white shadow-md"
                : "bg-gradient-to-r from-cyan-main to-cyan-deep text-white shadow-md"
            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
        >
            {/* <Package
            className={
                levelType === "box"
                ? "text-white"
                : "text-purple-main dark:text-purple-light"
            }
            size={18}
            />
            {t("boxes")} */}
            {isBox 
                ? <Package className="text-white" size={18} /> 
                : <Layers className="text-white" size={18} />}
            {isBox ? t("boxes") : t("balloons")}
        </button>
    </>
    )
}

        
        {/* <button
        onClick={() => handleLevelTypeChange("box")}
        className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            levelType === "box"
            ? "bg-gradient-to-r from-purple-deep to-purple-main text-white shadow-md"
            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
        >
        <Package
            className={
            levelType === "box"
                ? "text-white"
                : "text-purple-main dark:text-purple-light"
            }
            size={18}
        />
        {t("boxes")}
        </button> */}
        {/* ================================================ */}
        {/* <button
        onClick={() => handleLevelTypeChange("balloon")}
        className={`flex-1 py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            levelType === "balloon"
            ? "bg-gradient-to-r from-cyan-main to-cyan-deep text-white shadow-md"
            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
        }`}
        >
        <Layers
            className={
            levelType === "balloon"
                ? "text-white"
                : "text-cyan-main dark:text-cyan-light"
            }
            size={18}
        />
        {t("balloons")}
        </button> */}