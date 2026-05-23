import { useNavigate } from "react-router-dom";


export const Backbutton= () => {
  const navigate = useNavigate();
  return (
    <button onClick={()=>{navigate(-1)}} className="group mb-6 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors">
    <span className="mr-2 transition-transform group-hover:-translate-x-1">←</span> Back to list
</button>
  )
}

