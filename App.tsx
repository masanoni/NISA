
import React, { useState, useEffect } from 'react';
import SimulationConfig from './components/SimulationConfig';
import ResultsDashboard from './components/ResultsDashboard';
import { SimulationState, SimulationResultYear } from './types';
import { INITIAL_STATE } from './constants';
import { calculateSimulation } from './utils/simulation';
import { Calculator } from 'lucide-react';

const App: React.FC = () => {
  const [simulationState, setSimulationState] = useState<SimulationState>(INITIAL_STATE);
  const [results, setResults] = useState<SimulationResultYear[]>([]);

  useEffect(() => {
    const calculatedResults = calculateSimulation(simulationState);
    setResults(calculatedResults);
  }, [simulationState]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-red-600 text-white p-2 rounded-lg">
                <Calculator size={24} />
            </div>
            <div>
                 <h1 className="text-xl font-bold text-gray-900 tracking-tight">NISA Simulator</h1>
                 <p className="text-xs text-gray-500 font-medium">楽天証券主要銘柄対応版</p>
            </div>
          </div>
          <div className="hidden sm:block text-sm text-gray-500">
             新NISA完全対応 (生涯投資枠1,800万円)
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Panel: Configuration */}
          <div className="w-full lg:w-1/3 flex-shrink-0">
             <div className="lg:sticky lg:top-24">
                <SimulationConfig 
                  state={simulationState} 
                  onChange={setSimulationState} 
                />
             </div>
          </div>

          {/* Right Panel: Visualization */}
          <div className="w-full lg:w-2/3">
             <ResultsDashboard 
                results={results} 
                state={simulationState} 
             />
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
