const SkeletonLoader: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`} />
  );
  
  export default SkeletonLoader;