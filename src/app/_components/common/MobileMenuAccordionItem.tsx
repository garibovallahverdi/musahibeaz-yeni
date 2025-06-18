import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Route {
  label: string;
  href: string;
  children:{
    label:string,
    href:string
  }[]
}

const AccordionItem = ({ route }: { route: Route }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    // <div className="border rounded mb-2">
    //   <button
    //     className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 font-medium"
    //     onClick={() => setIsOpen(!isOpen)}
    //   >
    //     {title}
    //   </button>
    //   {isOpen && (
    //     <div className="px-4 py-2 text-gray-700 bg-white">
    //       {content}
    //     </div>
    //   )}
    // </div>


          <div className="flex flex-col w-full gap-1">
    
                  <p
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-sm w-full cursor-pointer  flex justify-between  font-semibold uppercase text-titleText "
                    >
                    {route.label}
                    {
                        isOpen?<span><ChevronDown/></span>:<span><ChevronRight /></span>
                    }
                  </p>
                {
                    isOpen  && (
                          
                  <div className="flex flex-col gap-3 pl-4">
                           {route.children.length > 0 &&
      route.children.map(({href, label}, index) => (
      <Link
        key={index}
        href={href}
        prefetch={false}
        className="block uppercase text-xs font-normal text-gray-900 dark:text-white hover:text-blue-600 truncate"
      >
        {label}
      </Link>
    ))}
                  </div>
                    )
                }
                    </div>
  );
};

export default AccordionItem