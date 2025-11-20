const Loader = ({ text = 'Loading...' }: { text?: string }) => {
  return (
    <div>
      <div className='min-h-screen flex items-center justify-center'>
        <div className='flex items-center space-x-3'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#477BFF]'></div>
          <div className='text-[#A7B0BE] text-lg'>{text}</div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
