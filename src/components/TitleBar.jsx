export default function TitleBar() {
  return (
    <header className="w-full border-b bg-white/80 px-4 py-3 backdrop-blur text-center">
      <h1 className="text-xl font-semibold">Southwark Listed Buildings Explorer</h1>
      <p className="mx-auto mt-1 max-w-8xl text-sm text-gray-600">
       An interactive map of Southwark’s listed buildings and heritage corridors.
      </p>
      <p className="mx-auto mt-1 max-w-8xl text-sm text-gray-600">
        Southwark grew around London Bridge and the Thames as a long-established hub of trade, worship, and entertainment, leaving dense layers of historic fabric.
        These layers are reflected in today’s listed buildings, which cluster along certain streets.
        
      </p>
       <p className="mx-auto mt-1 max-w-8xl text-sm text-gray-600">
      
        Streets are ranked as heritage corridors by the number of listed buildings.
        Select a street to view corridor-level patterns (grade and listing decade), or click a building to open its official listing PDF.
      </p>

      
    </header>
  );
}