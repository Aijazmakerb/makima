import React from "react";

const DotList = ({children}) => {
    const childrenLength = React.Children.count(children);

    return (
        <div
            className="text-sm font-medium font-karla"
        >
            {React.Children.map(children, (child, index) => {
                if(!child) return null;

                if(index === childrenLength - 1) {
                    return child;
                }
                return(
                    <>
                        {child}
                        <span className="text-white/50"> • </span>
                    </>
                )
            })}
        </div>
    )
}

export default DotList;