const BreweryProfileSkeleton = () => (
  <section className="w-1/2 m-auto animate-pulse">
    {/* Brewery Name */}
    <div className="h-8 w-1/2 mx-auto bg-gray-400 mb-4"></div>

    {/* Beer Categories */}
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="space-y-4">
          {/* Category Name */}
          <div className="h-8 bg-gray-200 w-1/3"></div>

          {/* Beers */}
          {[...Array(1)].map((_, j) => (
            <div key={j} className="flex space-x-4 w-full">
              <div className="h-16 bg-gray-300 w-full"></div>
            </div>
          ))}
        </div>
      ))}
    </div>

    {/* Archived Section */}
    <div className="mt-10 h-16 bg-gray-300 w-full"></div>

    {/* Create A Beer Button */}
    <div className="w-full h-full flex justify-center mt-4">
      <div className="btn btn-accent h-10 w-36 bg-gray-300"></div>
    </div>
  </section>
);
export default BreweryProfileSkeleton;
