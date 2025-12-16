
import React from 'react';
import { Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, ComposedChart } from 'recharts';
import { SimulationResultYear, SimulationState } from '../types';
import { formatCurrency, formatCurrencyFull } from '../utils/simulation';
import { Gift, Wallet, Shield, TrendingUp, PiggyBank, Coins, Banknote } from 'lucide-react';

interface Props {
  results: SimulationResultYear[];
  state: SimulationState;
}

const ResultsDashboard: React.FC<Props> = ({ results, state }) => {
  const finalResult = results[results.length - 1];
  const peakAssets = Math.max(...results.map(r => r.totalHouseholdAssets));
  const peakIndex = results.findIndex(r => r.totalHouseholdAssets === peakAssets);
  const peakResult = results[peakIndex];
  
  const h_Retirement = results.find(r => r.husbandAge === state.husband.withdrawalStartAge);
  const w_Retirement = results.find(r => r.wifeAge === state.wife.withdrawalStartAge);
  
  const zeroAssetYear = results.find(r => r.totalHouseholdAssets <= 0 && (r.husbandAge > state.husband.withdrawalStartAge || r.wifeAge > state.wife.withdrawalStartAge));

  const chartData = results;

  const renderCompositionChart = () => (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorHusbandNisaPrincipal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1E3A8A" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#1E3A8A" stopOpacity={0.4}/>
          </linearGradient>
          <linearGradient id="colorHusbandNisaProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.4}/>
          </linearGradient>

          <linearGradient id="colorWifeNisaPrincipal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9D174D" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#9D174D" stopOpacity={0.4}/>
          </linearGradient>
          <linearGradient id="colorWifeNisaProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F472B6" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#F472B6" stopOpacity={0.4}/>
          </linearGradient>

          <linearGradient id="colorInsPrincipal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#581C87" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#581C87" stopOpacity={0.4}/>
          </linearGradient>
          <linearGradient id="colorInsProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#A78BFA" stopOpacity={0.4}/>
          </linearGradient>

          <linearGradient id="colorIdecoPrincipal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0F766E" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#0F766E" stopOpacity={0.4}/>
          </linearGradient>
          <linearGradient id="colorIdecoProfit" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.9}/>
            <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0.4}/>
          </linearGradient>

          <linearGradient id="colorGifts" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <XAxis 
          dataKey="husbandAge" 
          type="number"
          domain={['dataMin', 'auto']}
          tickFormatter={(val) => `${val}歳`}
          label={{ value: '夫の年齢', position: 'insideBottomRight', offset: -5 }} 
        />
        <YAxis 
          tickFormatter={(value) => `${(value / 100000000).toFixed(1)}億`}
          width={60}
        />
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <Tooltip 
          formatter={(value: number, name: string) => [formatCurrencyFull(value), name]}
          labelFormatter={(label, payload) => {
             const year = payload?.[0]?.payload?.calendarYear;
             const roi = payload?.[0]?.payload?.totalRoi;
             const roiStr = roi > 0 ? `+${roi}%` : `${roi}%`;
             return (
               <div className="mb-1">
                 <span className="font-bold">夫 {label}歳 ({year}年)</span>
                 <span className={`ml-2 text-xs font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                   含み益率: {roiStr}
                 </span>
               </div>
             );
          }}
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
        />
        <Legend verticalAlign="top" height={80} iconType="rect" wrapperStyle={{ fontSize: '11px' }}/>
        
        {/* Insurance */}
        <Area type="monotone" dataKey="h_insPrincipal" name="夫 保険(元本)" stackId="1" stroke="none" fill="url(#colorInsPrincipal)" />
        <Area type="monotone" dataKey="h_insProfit" name="夫 保険(利益)" stackId="1" stroke="#7C3AED" fill="url(#colorInsProfit)" />
        <Area type="monotone" dataKey="w_insPrincipal" name="妻 保険(元本)" stackId="1" stroke="none" fill="url(#colorInsPrincipal)" />
        <Area type="monotone" dataKey="w_insProfit" name="妻 保険(利益)" stackId="1" stroke="#7C3AED" fill="url(#colorInsProfit)" />

        {/* iDeCo */}
        <Area type="monotone" dataKey="h_idecoPrincipal" name="夫 iDeCo(元本)" stackId="1" stroke="none" fill="url(#colorIdecoPrincipal)" />
        <Area type="monotone" dataKey="h_idecoProfit" name="夫 iDeCo(利益)" stackId="1" stroke="#0D9488" fill="url(#colorIdecoProfit)" />
        <Area type="monotone" dataKey="w_idecoPrincipal" name="妻 iDeCo(元本)" stackId="1" stroke="none" fill="url(#colorIdecoPrincipal)" />
        <Area type="monotone" dataKey="w_idecoProfit" name="妻 iDeCo(利益)" stackId="1" stroke="#0D9488" fill="url(#colorIdecoProfit)" />

        {/* NISA */}
        <Area type="monotone" dataKey="h_nisaPrincipal" name="夫 NISA(元本)" stackId="1" stroke="none" fill="url(#colorHusbandNisaPrincipal)" />
        <Area type="monotone" dataKey="h_nisaProfit" name="夫 NISA(利益)" stackId="1" stroke="#2563EB" fill="url(#colorHusbandNisaProfit)" />
        <Area type="monotone" dataKey="w_nisaPrincipal" name="妻 NISA(元本)" stackId="1" stroke="none" fill="url(#colorWifeNisaPrincipal)" />
        <Area type="monotone" dataKey="w_nisaProfit" name="妻 NISA(利益)" stackId="1" stroke="#DB2777" fill="url(#colorWifeNisaProfit)" />

        {/* Gifts */}
        <Area type="monotone" dataKey="cumulativeGifts" name="資産移転累計" stackId="1" stroke="#10B981" fill="url(#colorGifts)" />
        
        <ReferenceLine x={state.husband.withdrawalStartAge} stroke="#3B82F6" strokeDasharray="3 3" label={{ value: "夫引退", position: 'insideTopLeft', fontSize: 10, fill: "#3B82F6" }} />
      </ComposedChart>
    </ResponsiveContainer>
  );

  const renderAnnualContributionChart = () => (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis 
            dataKey="husbandAge" 
            type="number"
            domain={['dataMin', 'auto']}
            tickFormatter={(val) => `${val}歳`}
          />
          <YAxis 
             tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
             width={60}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip 
            formatter={(value: number, name: string) => [formatCurrencyFull(value), name]}
            labelFormatter={(label) => `夫 ${label}歳時点の年間支払額`}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend verticalAlign="top" height={30} iconType="rect" wrapperStyle={{ fontSize: '11px' }}/>
          
          <Bar dataKey="h_totalAnnualContribution" name="夫 年間投資額(合計)" stackId="a" fill="#3B82F6" />
          <Bar dataKey="w_totalAnnualContribution" name="妻 年間投資額(合計)" stackId="a" fill="#EC4899" />
        </ComposedChart>
      </ResponsiveContainer>
  );

  const renderCashFlowChart = () => (
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <XAxis 
            dataKey="husbandAge" 
            type="number"
            domain={['dataMin', 'auto']}
            tickFormatter={(val) => `${val}歳`}
          />
          <YAxis 
             tickFormatter={(value) => `${(value / 10000).toFixed(0)}万`}
             width={60}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip 
            formatter={(value: number, name: string) => [formatCurrencyFull(value), name]}
            labelFormatter={(label, payload) => {
                 const gross = payload?.[0]?.payload?.household_grossIncome;
                 return (
                     <div className="mb-1">
                         <span className="font-bold">夫{label}歳 手取り・使途内訳</span>
                         {gross > 0 && <div className="text-xs text-gray-500">世帯額面年収: {formatCurrencyFull(gross)}</div>}
                     </div>
                 )
            }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Legend verticalAlign="top" height={30} iconType="rect" wrapperStyle={{ fontSize: '11px' }}/>
          
          <Bar dataKey="annual_housing_cost" name="住宅費(ローン+管理費)" stackId="a" fill="#6366f1" />
          <Bar dataKey="annual_fixed_cost" name="生活固定費" stackId="a" fill="#f59e0b" />
          <Bar dataKey="h_totalAnnualContribution" name="夫 投資" stackId="a" fill="#3B82F6" />
          <Bar dataKey="w_totalAnnualContribution" name="妻 投資" stackId="a" fill="#EC4899" />
          <Bar dataKey="household_disposable_after_fixed" name="生活費・その他(残金)" stackId="a" fill="#10B981" />
          
        </ComposedChart>
      </ResponsiveContainer>
  );
  
  return (
    <div className="space-y-8">
      
      {/* Household Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-2 opacity-10">
             <Wallet size={48} />
          </div>
          <p className="text-sm text-gray-500 mb-1">夫婦合算 最大資産額</p>
          <div className="flex items-baseline space-x-2">
            <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(peakAssets)}
            </p>
          </div>
          
          <div className="flex items-center mt-2 space-x-1">
             <span className="text-xs text-gray-400">元本 {formatCurrency(peakResult?.totalHouseholdPrincipal || 0)}</span>
             {peakResult && (
               <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${peakResult.totalRoi >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                 {peakResult.totalRoi > 0 ? '+' : ''}{peakResult.totalRoi}%
               </span>
             )}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">夫: {state.husband.withdrawalStartAge}歳時点</p>
          <p className="text-xl font-bold text-blue-600">
            {h_Retirement ? formatCurrency(h_Retirement.h_totalAssets) : '-'}
          </p>
          <p className="text-xs text-gray-400">
             NISA: {h_Retirement ? formatCurrency(h_Retirement.h_nisaAssets) : '-'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">妻: {state.wife.withdrawalStartAge}歳時点</p>
          <p className="text-xl font-bold text-pink-600">
            {w_Retirement ? formatCurrency(w_Retirement.w_totalAssets) : '-'}
          </p>
          <p className="text-xs text-gray-400">
             NISA: {w_Retirement ? formatCurrency(w_Retirement.w_nisaAssets) : '-'}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">世帯資産寿命</p>
          <p className={`text-2xl font-bold ${zeroAssetYear ? 'text-red-500' : 'text-emerald-500'}`}>
            {zeroAssetYear ? `${zeroAssetYear.husbandAge}歳頃` : '100歳+'}
          </p>
           <p className="text-xs text-gray-400">
            {zeroAssetYear ? 'で資産が枯渇します' : 'まで資産が残ります'}
          </p>
        </div>
      </div>
      
      {/* Main Chart Section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-gray-600" />
                世帯資産構成 (内訳)
            </h3>
        </div>
        
        <div className="h-[450px] w-full">
           {renderCompositionChart()}
        </div>
        
        <p className="mt-4 text-xs text-gray-500 text-center">
           ※ 濃い色が「元本」、薄い色が「利益」を表しています。
        </p>
      </div>

      {/* Cash Flow Chart (New) */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
         <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Banknote className="w-5 h-5 mr-2 text-emerald-600" />
                年間キャッシュフロー・可処分所得 (手取りからの配分)
            </h3>
        </div>
        <div className="h-[400px] w-full">
            {renderCashFlowChart()}
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
           <p>※ 棒グラフの全体高さが「世帯手取り年収」を表します。</p>
           <p>※ 住宅ローン控除、社会保険料等を簡易計算して算出しています。</p>
        </div>
      </div>

      {/* Annual Contribution Chart */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100">
         <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                <Coins className="w-5 h-5 mr-2 text-yellow-600" />
                年間支払額 (投資・保険)
            </h3>
        </div>
        <div className="h-[300px] w-full">
            {renderAnnualContributionChart()}
        </div>
        <p className="mt-2 text-xs text-gray-500 text-center">
           ※ NISA積立、iDeCo、保険料の合計年額を表示しています。
        </p>
      </div>
      
      {/* 2. Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100">
             <h4 className="font-bold text-gray-700 mb-4 flex items-center">
                <Gift className="w-4 h-4 mr-2 text-green-600" />
                贈与・資産移転詳細
             </h4>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                   <span className="text-gray-600">子供の人数</span>
                   <span className="font-medium">{state.family.children.length}人</span>
                </div>
                <div className="flex justify-between pt-2">
                   <span className="font-bold text-gray-800">移転資産総額</span>
                   <span className="font-bold text-green-600">{formatCurrency(finalResult?.cumulativeGifts || 0)}</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100">
             <h4 className="font-bold text-gray-700 mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-purple-600" />
                保険資産 (最終)
             </h4>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b pb-2">
                   <span className="text-gray-600">夫</span>
                   <span className="font-medium text-purple-800">{formatCurrency(finalResult?.h_insuranceAssets || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                   <span className="text-gray-600">妻</span>
                   <span className="font-medium text-purple-800">{formatCurrency(finalResult?.w_insuranceAssets || 0)}</span>
                </div>
             </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100">
             <h4 className="font-bold text-gray-700 mb-4 flex items-center">
                <PiggyBank className="w-4 h-4 mr-2 text-teal-600" />
                iDeCo資産 (最終)
             </h4>
             <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center border-b pb-2">
                   <span className="text-gray-600">夫</span>
                   <span className="font-medium text-teal-800">{formatCurrency(finalResult?.h_idecoAssets || 0)}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                   <span className="text-gray-600">妻</span>
                   <span className="font-medium text-teal-800">{formatCurrency(finalResult?.w_idecoAssets || 0)}</span>
                </div>
             </div>
          </div>
      </div>

    </div>
  );
};

export default ResultsDashboard;
