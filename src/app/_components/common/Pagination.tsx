import React from 'react'

const Pagination = ({count,page,limit,setPage}:{count:number, page:number, limit:number,setPage:React.Dispatch<React.SetStateAction<number>>}) => {
  return (
<>

<div className="flex flex-col  items-center">
  <span className="text-sm text-gray-700 dark:text-gray-400">
      Showing <span className="font-semibold   ">{page}</span> to <span className="font-semibold  ">{limit}</span> of <span className="font-semibold ">{count}</span> Entries
  </span>
  <div className="inline-flex mt-2 gap-1 xs:mt-0">
      <button 
      disabled={page<=1?true:false}
      onClick={()=>setPage(prev=>prev-1)} 
      className="flex bg-buttonBg text-titleText disabled:bg-buttonDisabledBg disabled:text-buttonDisabledText hover:bg-buttonHoverBg  items-center justify-center px-3 h-8 text-sm font-medium  border-0 border-s  rounded-s    ">
          Prev
      </button>
      <button 
      disabled={page * limit>=count?true:false}

      onClick={()=>setPage(prev=>prev+1)} 
      className="flex bg-buttonBg text-titleText disabled:bg-buttonDisabledBg disabled:text-buttonDisabledText hover:bg-buttonHoverBg  items-center justify-center px-3 h-8 text-sm font-medium  border-0 border-s  rounded-e ">
          Next
      </button>
  </div>
</div>

</>
  )
}

export default Pagination