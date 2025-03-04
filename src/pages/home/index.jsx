
import { useNavigate } from "react-router-dom";
const Home = () => {
    const navigate = useNavigate();
    const handleBarchart = () => {
        navigate("/samplebarchart");
    }
    return (
        <>
            <div className="flex items-center self-center justify-center h-96">

                <h1>Welcome </h1>
                <button
                    onClick={handleBarchart}
                >Get sample </button>
            </div>
        </>
    )
}

export default Home