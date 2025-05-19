
const LoadingSpinner = () => {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-white">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#A71963] border-t-transparent" />
      </div>
    );
  };
  
  export default LoadingSpinner;