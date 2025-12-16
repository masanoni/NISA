
import React, { useState, useRef } from 'react';
import { SimulationState, BonusContribution, PersonProfile, InsuranceProduct, PortfolioAllocation, ChildProfile, ContributionPeriod, IdecoProfile, IncomePeriod, FixedCostItem, GiftReceivingPeriod } from '../types';
import { RAKUTEN_MAJOR_STOCKS, INSURANCE_PRESETS } from '../constants';
import { getWeightedReturnRate } from '../utils/simulation';
import { PlusCircle, Trash2, Info, TrendingUp, AlertCircle, Users, Gift, User, Heart, ShieldPlus, Save, Upload, PieChart, Calendar, Clock, PiggyBank, Briefcase, Home, Wallet, Calculator } from 'lucide-react';

interface Props {
  state: SimulationState;
  onChange: (newState: SimulationState) => void;
}

const SimulationConfig: React.FC<Props> = ({ state, onChange }) => {
  const [activeTab, setActiveTab] = useState<'husband' | 'wife' | 'family'>('husband');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Save / Load ---
  const handleSave = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `nisa_simulation_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onChange(json);
      } catch (err) {
        alert("ファイルの読み込みに失敗しました。形式を確認してください。");
      }
    };
    reader.readAsText(file);
  };

  // --- Generic Updaters ---

  const updatePerson = (role: 'husband' | 'wife', field: keyof PersonProfile, value: any) => {
    onChange({
      ...state,
      [role]: { ...state[role], [field]: value }
    });
  };

  // --- Income Handlers ---
  const addIncomePeriod = (role: 'husband' | 'wife') => {
    const person = state[role];
    const newPeriod: IncomePeriod = {
        id: Math.random().toString(36).substr(2, 9),
        startAge: 25,
        endAge: 60,
        amount: 4000000
    };
    updatePerson(role, 'incomePeriods', [...person.incomePeriods, newPeriod]);
  };

  const updateIncomePeriod = (role: 'husband' | 'wife', id: string, field: keyof IncomePeriod, value: any) => {
    const person = state[role];
    const newPeriods = person.incomePeriods.map(p => 
       p.id === id ? { ...p, [field]: value } : p
    );
    updatePerson(role, 'incomePeriods', newPeriods);
  };

  const removeIncomePeriod = (role: 'husband' | 'wife', id: string) => {
     const person = state[role];
     updatePerson(role, 'incomePeriods', person.incomePeriods.filter(p => p.id !== id));
  };


  // --- Gift Receiving Handlers ---
  const addGiftReceivingPeriod = (role: 'husband' | 'wife') => {
    const person = state[role];
    const newPeriod: GiftReceivingPeriod = {
        id: Math.random().toString(36).substr(2, 9),
        startAge: 30,
        endAge: 40,
        amount: 1100000
    };
    updatePerson(role, 'giftReceivingPeriods', [...person.giftReceivingPeriods, newPeriod]);
  };

  const updateGiftReceivingPeriod = (role: 'husband' | 'wife', id: string, field: keyof GiftReceivingPeriod, value: any) => {
    const person = state[role];
    const newPeriods = person.giftReceivingPeriods.map(p => 
       p.id === id ? { ...p, [field]: value } : p
    );
    updatePerson(role, 'giftReceivingPeriods', newPeriods);
  };

  const removeGiftReceivingPeriod = (role: 'husband' | 'wife', id: string) => {
     const person = state[role];
     updatePerson(role, 'giftReceivingPeriods', person.giftReceivingPeriods.filter(p => p.id !== id));
  };


  // --- NISA Contribution Period Handlers ---
  const addPeriod = (role: 'husband' | 'wife') => {
    const person = state[role];
    const today = new Date();
    const startStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const endStr = `${today.getFullYear() + 5}-12`;
    
    const newPeriod: ContributionPeriod = {
       id: Math.random().toString(36).substr(2, 9),
       startMonth: startStr,
       endMonth: endStr,
       amount: 30000
    };
    updatePerson(role, 'contributionPeriods', [...person.contributionPeriods, newPeriod]);
  };

  const updatePeriod = (role: 'husband' | 'wife', id: string, field: keyof ContributionPeriod, value: any) => {
    const person = state[role];
    const newPeriods = person.contributionPeriods.map(p => 
       p.id === id ? { ...p, [field]: value } : p
    );
    updatePerson(role, 'contributionPeriods', newPeriods);
  };

  const removePeriod = (role: 'husband' | 'wife', id: string) => {
     const person = state[role];
     updatePerson(role, 'contributionPeriods', person.contributionPeriods.filter(p => p.id !== id));
  };


  // --- iDeCo Handlers ---

  const updateIdeco = (role: 'husband' | 'wife', field: keyof IdecoProfile, value: any) => {
      const person = state[role];
      updatePerson(role, 'ideco', { ...person.ideco, [field]: value });
  };

  const addIdecoPeriod = (role: 'husband' | 'wife') => {
    const person = state[role];
    const today = new Date();
    const startStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const endStr = `${today.getFullYear() + 5}-12`;
    
    const newPeriod: ContributionPeriod = {
       id: Math.random().toString(36).substr(2, 9),
       startMonth: startStr,
       endMonth: endStr,
       amount: 23000
    };
    updateIdeco(role, 'contributionPeriods', [...person.ideco.contributionPeriods, newPeriod]);
  };

  const updateIdecoPeriod = (role: 'husband' | 'wife', id: string, field: keyof ContributionPeriod, value: any) => {
    const person = state[role];
    const newPeriods = person.ideco.contributionPeriods.map(p => 
       p.id === id ? { ...p, [field]: value } : p
    );
    updateIdeco(role, 'contributionPeriods', newPeriods);
  };

  const removeIdecoPeriod = (role: 'husband' | 'wife', id: string) => {
     const person = state[role];
     updateIdeco(role, 'contributionPeriods', person.ideco.contributionPeriods.filter(p => p.id !== id));
  };

  const addIdecoPortfolioItem = (role: 'husband' | 'wife') => {
      const person = state[role];
      const newItem: PortfolioAllocation = { stockId: RAKUTEN_MAJOR_STOCKS[0].id, percentage: 0 };
      updateIdeco(role, 'portfolio', [...person.ideco.portfolio, newItem]);
  };

  const updateIdecoPortfolioItem = (role: 'husband' | 'wife', index: number, field: keyof PortfolioAllocation, value: any) => {
      const person = state[role];
      const newPortfolio = [...person.ideco.portfolio];
      newPortfolio[index] = { ...newPortfolio[index], [field]: value };
      updateIdeco(role, 'portfolio', newPortfolio);
  };
    
  const removeIdecoPortfolioItem = (role: 'husband' | 'wife', index: number) => {
      const person = state[role];
      const newPortfolio = [...person.ideco.portfolio];
      newPortfolio.splice(index, 1);
      updateIdeco(role, 'portfolio', newPortfolio);
  };


  // --- Bonus Handlers ---
  const updateBonus = (role: 'husband' | 'wife', bonusId: string, field: keyof BonusContribution, value: number) => {
    const person = state[role];
    const newBonuses = person.bonusContributions.map(b => 
      b.id === bonusId ? { ...b, [field]: value } : b
    );
    updatePerson(role, 'bonusContributions', newBonuses);
  };

  const addBonus = (role: 'husband' | 'wife') => {
    const person = state[role];
    const currentAge = new Date().getFullYear() - parseInt(person.birthDate.split('-')[0]);
    const newBonus: BonusContribution = {
      id: Math.random().toString(36).substr(2, 9),
      age: currentAge + 1,
      amount: 1000000
    };
    updatePerson(role, 'bonusContributions', [...person.bonusContributions, newBonus]);
  };

  const removeBonus = (role: 'husband' | 'wife', bonusId: string) => {
    const person = state[role];
    updatePerson(role, 'bonusContributions', person.bonusContributions.filter(b => b.id !== bonusId));
  };

  // --- Portfolio Handlers (NISA) ---

  const addPortfolioItem = (role: 'husband' | 'wife') => {
    const person = state[role];
    const newItem: PortfolioAllocation = { stockId: RAKUTEN_MAJOR_STOCKS[0].id, percentage: 0 };
    updatePerson(role, 'portfolio', [...person.portfolio, newItem]);
  };

  const updatePortfolioItem = (role: 'husband' | 'wife', index: number, field: keyof PortfolioAllocation, value: any) => {
    const person = state[role];
    const newPortfolio = [...person.portfolio];
    newPortfolio[index] = { ...newPortfolio[index], [field]: value };
    updatePerson(role, 'portfolio', newPortfolio);
  };

  const removePortfolioItem = (role: 'husband' | 'wife', index: number) => {
    const person = state[role];
    const newPortfolio = [...person.portfolio];
    newPortfolio.splice(index, 1);
    updatePerson(role, 'portfolio', newPortfolio);
  };

  // --- Insurance Handlers ---
  const addInsurance = (role: 'husband' | 'wife') => {
    const person = state[role];
    const todayStr = new Date().toISOString().split('T')[0];
    const newIns: InsuranceProduct = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'ソニー生命 変額・世界株式型 (GQ)',
      recordedDate: todayStr,
      monthlyPremium: 10000,
      totalPremiumsPaid: 0,
      currentCashValue: 0,
      expectedReturnRate: 6.0,
      paymentEndAge: 65,
    };
    updatePerson(role, 'insuranceProducts', [...person.insuranceProducts, newIns]);
  };

  const updateInsurance = (role: 'husband' | 'wife', id: string, field: keyof InsuranceProduct, value: any) => {
    const person = state[role];
    const newProducts = person.insuranceProducts.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    updatePerson(role, 'insuranceProducts', newProducts);
  };

  const removeInsurance = (role: 'husband' | 'wife', id: string) => {
    const person = state[role];
    updatePerson(role, 'insuranceProducts', person.insuranceProducts.filter(p => p.id !== id));
  };

  const applyInsurancePreset = (role: 'husband' | 'wife', id: string, presetName: string) => {
    const preset = INSURANCE_PRESETS.find(p => p.name === presetName);
    if (preset) {
        const person = state[role];
        const newProducts = person.insuranceProducts.map(p => 
            p.id === id ? { ...p, name: preset.name || p.name, expectedReturnRate: preset.expectedReturnRate || p.expectedReturnRate } : p
        );
        updatePerson(role, 'insuranceProducts', newProducts);
    }
  };

  // --- Child Handlers ---
  const addChild = () => {
    const newChild: ChildProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: `子供${state.family.children.length + 1}`,
      birthDate: `${new Date().getFullYear() - 5}-01-01`
    };
    onChange({
      ...state,
      family: { ...state.family, children: [...state.family.children, newChild] }
    });
  };

  const updateChild = (id: string, field: keyof ChildProfile, value: any) => {
    const newChildren = state.family.children.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    onChange({
      ...state,
      family: { ...state.family, children: newChildren }
    });
  };

  const removeChild = (id: string) => {
    const newChildren = state.family.children.filter(c => c.id !== id);
    onChange({
      ...state,
      family: { ...state.family, children: newChildren }
    });
  };

  // --- Fixed Cost Handlers ---
  const addFixedCost = () => {
    const newItem: FixedCostItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '新規項目',
      amount: 10000,
      frequency: 'monthly'
    };
    onChange({
      ...state,
      family: { ...state.family, fixedCosts: [...state.family.fixedCosts, newItem] }
    });
  };

  const updateFixedCost = (id: string, field: keyof FixedCostItem, value: any) => {
     const newItems = state.family.fixedCosts.map(item => 
       item.id === id ? { ...item, [field]: value } : item
     );
     onChange({
       ...state,
       family: { ...state.family, fixedCosts: newItems }
     });
  };

  const removeFixedCost = (id: string) => {
     const newItems = state.family.fixedCosts.filter(item => item.id !== id);
     onChange({
       ...state,
       family: { ...state.family, fixedCosts: newItems }
     });
  };

  // --- Render Functions ---

  const renderPersonConfig = (role: 'husband' | 'wife', profile: PersonProfile) => {
    const currentRate = getWeightedReturnRate(profile.portfolio);
    const totalAlloc = profile.portfolio.reduce((sum, p) => sum + p.percentage, 0);
    
    const idecoRate = getWeightedReturnRate(profile.ideco.portfolio);
    const idecoAlloc = profile.ideco.portfolio.reduce((sum, p) => sum + p.percentage, 0);

    const birthYear = parseInt(profile.birthDate.split('-')[0]);
    const currentYear = new Date().getFullYear();
    const displayAge = currentYear - birthYear;

    return (
    <div className="space-y-8 animate-fadeIn">
      {/* Basic Profile */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
          <Info className="w-4 h-4 mr-1" /> 基本プロフィール ({profile.name})
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">生年月日</label>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={profile.birthDate}
                onChange={(e) => updatePerson(role, 'birthDate', e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 border p-2"
              />
              <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                (現在 {displayAge}歳)
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Income Section */}
      <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center text-emerald-700">
             <Briefcase className="w-4 h-4 mr-1" /> 年収・控除設定
          </h3>
          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 mb-3">
             <label className="block text-xs font-bold text-emerald-800 mb-1 flex items-center">
                 <Calculator className="w-3 h-3 mr-1" /> ふるさと納税 (年間寄付額)
             </label>
             <div className="relative">
                 <input
                     type="number"
                     value={profile.furusatoNozeiAmount}
                     onChange={(e) => updatePerson(role, 'furusatoNozeiAmount', Number(e.target.value))}
                     className="block w-full rounded-md border-emerald-200 shadow-sm text-sm p-2 text-right pr-8"
                 />
                 <span className="absolute right-3 top-2 text-emerald-500 text-sm">円</span>
             </div>
             <p className="text-[10px] text-emerald-600 mt-1">※ (寄付額 - 2,000円) が住民税から控除される計算になります</p>
          </div>

          <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
             <p className="text-xs text-emerald-700 mb-2 font-bold">年齢ごとの額面年収 (手取りは自動計算)</p>
             {profile.incomePeriods.map((period) => (
                <div key={period.id} className="bg-white p-2 rounded mb-2 border border-emerald-100 flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                        <input
                           type="number"
                           value={period.startAge}
                           onChange={(e) => updateIncomePeriod(role, period.id, 'startAge', Number(e.target.value))}
                           className="w-12 text-sm border rounded p-1 text-right"
                        />
                        <span className="text-xs">歳 ~</span>
                        <input
                           type="number"
                           value={period.endAge}
                           onChange={(e) => updateIncomePeriod(role, period.id, 'endAge', Number(e.target.value))}
                           className="w-12 text-sm border rounded p-1 text-right"
                        />
                        <span className="text-xs">歳</span>
                    </div>
                    <div className="flex-1 relative">
                        <input
                           type="number"
                           value={period.amount}
                           onChange={(e) => updateIncomePeriod(role, period.id, 'amount', Number(e.target.value))}
                           step={100000}
                           className="w-full text-sm border rounded p-1 text-right pr-6"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-gray-500">円</span>
                    </div>
                    <button onClick={() => removeIncomePeriod(role, period.id)} className="text-red-400">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
             ))}
             <button onClick={() => addIncomePeriod(role)} className="text-xs text-emerald-600 flex items-center font-medium mt-1">
                 <PlusCircle className="w-3 h-3 mr-1" /> 期間を追加する
              </button>
          </div>
      </section>

       {/* Gift Receiving Section */}
       <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center text-yellow-600">
             <Gift className="w-4 h-4 mr-1" /> 親からの暦年贈与受取
          </h3>
          <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
             <p className="text-[10px] text-yellow-700 mb-2">
                 ※ ここに入力した金額は「所得」には含まれず、手取り(可処分所得)に直接加算されます。<br/>
                 ※ 投資原資として利用可能です。税務上の贈与税計算は行いません(手取り額を入力してください)。
             </p>
             {profile.giftReceivingPeriods.map((period) => (
                <div key={period.id} className="bg-white p-2 rounded mb-2 border border-yellow-100 flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                        <input
                           type="number"
                           value={period.startAge}
                           onChange={(e) => updateGiftReceivingPeriod(role, period.id, 'startAge', Number(e.target.value))}
                           className="w-12 text-sm border rounded p-1 text-right"
                        />
                        <span className="text-xs">歳 ~</span>
                        <input
                           type="number"
                           value={period.endAge}
                           onChange={(e) => updateGiftReceivingPeriod(role, period.id, 'endAge', Number(e.target.value))}
                           className="w-12 text-sm border rounded p-1 text-right"
                        />
                        <span className="text-xs">歳</span>
                    </div>
                    <div className="flex-1 relative">
                        <input
                           type="number"
                           value={period.amount}
                           onChange={(e) => updateGiftReceivingPeriod(role, period.id, 'amount', Number(e.target.value))}
                           step={100000}
                           className="w-full text-sm border rounded p-1 text-right pr-6"
                        />
                        <span className="absolute right-2 top-1.5 text-xs text-gray-500">円</span>
                    </div>
                    <button onClick={() => removeGiftReceivingPeriod(role, period.id)} className="text-red-400">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
             ))}
             <button onClick={() => addGiftReceivingPeriod(role)} className="text-xs text-yellow-600 flex items-center font-medium mt-1">
                 <PlusCircle className="w-3 h-3 mr-1" /> 贈与受取期間を追加
              </button>
          </div>
      </section>

      {/* Assets (NISA) */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1" /> 新NISA 設定
        </h3>
        
        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 mb-3">
           <label className="block text-xs font-bold text-orange-800 mb-1 flex items-center">
             <Calendar className="w-3 h-3 mr-1" /> 資産記録日
           </label>
           <input
              type="date"
              value={profile.assetDataDate}
              onChange={(e) => updatePerson(role, 'assetDataDate', e.target.value)}
              className="block w-full rounded-md border-orange-200 shadow-sm text-sm p-1 bg-white"
            />
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">投資元本 (記録日時点)</label>
            <div className="relative">
              <input
                type="number"
                value={profile.currentPrincipal}
                onChange={(e) => updatePerson(role, 'currentPrincipal', Number(e.target.value))}
                step={10000}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 border p-2 text-right pr-12"
              />
              <span className="absolute right-3 top-2 text-gray-500 text-sm">円</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">運用益/含み益 (記録日時点)</label>
            <div className="relative">
              <input
                type="number"
                value={profile.currentProfit}
                onChange={(e) => updatePerson(role, 'currentProfit', Number(e.target.value))}
                step={10000}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 border p-2 text-right pr-12"
              />
               <span className="absolute right-3 top-2 text-gray-500 text-sm">円</span>
            </div>
          </div>
        </div>

        <h4 className="text-xs font-bold text-gray-600 mb-2">NISA ポートフォリオ</h4>
        <div className="space-y-3 bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
           {profile.portfolio.map((item, idx) => (
             <div key={idx} className="flex items-center space-x-2">
                <select 
                  className="flex-1 rounded-md border-gray-300 shadow-sm text-xs p-2"
                  value={item.stockId}
                  onChange={(e) => updatePortfolioItem(role, idx, 'stockId', e.target.value)}
                >
                   {RAKUTEN_MAJOR_STOCKS.map(s => (
                     <option key={s.id} value={s.id}>{s.name} ({s.rate}%)</option>
                   ))}
                </select>
                <div className="flex items-center w-24">
                   <input 
                     type="number" 
                     value={item.percentage}
                     onChange={(e) => updatePortfolioItem(role, idx, 'percentage', Number(e.target.value))}
                     className="w-12 p-1 border rounded text-right text-xs"
                   />
                   <span className="text-xs ml-1">%</span>
                </div>
                <button onClick={() => removePortfolioItem(role, idx)} className="text-gray-400 hover:text-red-500">
                   <Trash2 className="w-4 h-4" />
                </button>
             </div>
           ))}
           <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <button onClick={() => addPortfolioItem(role)} className="text-xs text-blue-600 flex items-center font-medium">
                 <PlusCircle className="w-3 h-3 mr-1" /> 銘柄を追加
              </button>
              <div className={`text-xs font-bold ${totalAlloc !== 100 ? 'text-red-500' : 'text-gray-600'}`}>
                 合計: {totalAlloc}%
              </div>
           </div>
        </div>
        
        {/* NISA Contribution Plans */}
        <div className="space-y-4">
           <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 flex items-center">
                  <Clock className="w-3 h-3 mr-1"/>
                  NISA 積立計画 (つみたて枠)
              </label>
              {profile.contributionPeriods.map((period) => (
                  <div key={period.id} className="bg-gray-50 p-2 rounded mb-2 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-1">
                          <input 
                             type="month" 
                             value={period.startMonth}
                             onChange={(e) => updatePeriod(role, period.id, 'startMonth', e.target.value)}
                             className="text-xs border rounded p-1 w-28"
                          />
                          <span className="text-xs text-gray-500">〜</span>
                          <input 
                             type="month" 
                             value={period.endMonth}
                             onChange={(e) => updatePeriod(role, period.id, 'endMonth', e.target.value)}
                             className="text-xs border rounded p-1 w-28"
                          />
                      </div>
                      <div className="flex items-center space-x-2">
                           <div className="relative flex-1">
                              <input 
                                 type="number"
                                 value={period.amount}
                                 onChange={(e) => updatePeriod(role, period.id, 'amount', Number(e.target.value))}
                                 step={1000}
                                 className="w-full text-sm border rounded p-1 text-right pr-6"
                              />
                              <span className="absolute right-2 top-1.5 text-xs text-gray-500">円</span>
                           </div>
                           <button onClick={() => removePeriod(role, period.id)} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                           </button>
                      </div>
                  </div>
              ))}
              <button onClick={() => addPeriod(role)} className="text-xs text-blue-600 flex items-center font-medium mt-1">
                 <PlusCircle className="w-3 h-3 mr-1" /> 期間を追加する
              </button>
           </div>

          <div className="border-t border-gray-100 pt-3">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              成長投資枠 (ボーナス/一括)
            </label>
            {profile.bonusContributions.map((bonus) => (
              <div key={bonus.id} className="flex items-center space-x-2 mb-2 bg-gray-50 p-2 rounded">
                 <div className="flex items-center">
                    <input 
                      type="number" 
                      value={bonus.age}
                      onChange={(e) => updateBonus(role, bonus.id, 'age', Number(e.target.value))}
                      className="w-14 p-1 border rounded text-right text-sm"
                    />
                    <span className="text-xs ml-1 whitespace-nowrap">歳時</span>
                 </div>
                 <div className="flex-1 relative">
                    <input 
                      type="number" 
                      value={bonus.amount}
                      onChange={(e) => updateBonus(role, bonus.id, 'amount', Number(e.target.value))}
                      className="w-full p-1 border rounded text-right text-sm"
                    />
                 </div>
                 <button onClick={() => removeBonus(role, bonus.id)} className="text-red-400 hover:text-red-600">
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
            ))}
            <button onClick={() => addBonus(role)} className="mt-2 flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium">
              <PlusCircle className="w-3 h-3 mr-1" /> 追加する
            </button>
          </div>
        </div>
      </section>

      {/* iDeCo Section */}
      <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center text-teal-700">
              <PiggyBank className="w-4 h-4 mr-1" /> iDeCo (個人型確定拠出年金)
          </h3>
          <div className="bg-teal-50 border border-teal-100 p-4 rounded-lg space-y-4">
              <div className="bg-white p-2 rounded border border-teal-100">
                <label className="block text-xs font-bold text-teal-800 mb-1 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" /> iDeCo資産記録日
                </label>
                <input
                    type="date"
                    value={profile.ideco.assetDataDate}
                    onChange={(e) => updateIdeco(role, 'assetDataDate', e.target.value)}
                    className="block w-full rounded-md border-teal-200 shadow-sm text-sm p-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                 <div>
                    <label className="text-xs text-teal-900 block font-medium">投資元本(現在)</label>
                    <input
                       type="number"
                       value={profile.ideco.currentPrincipal}
                       onChange={(e) => updateIdeco(role, 'currentPrincipal', Number(e.target.value))}
                       className="w-full rounded border-teal-200 text-right text-sm p-1"
                    />
                 </div>
                 <div>
                    <label className="text-xs text-teal-900 block font-medium">評価益(現在)</label>
                    <input
                       type="number"
                       value={profile.ideco.currentProfit}
                       onChange={(e) => updateIdeco(role, 'currentProfit', Number(e.target.value))}
                       className="w-full rounded border-teal-200 text-right text-sm p-1"
                    />
                 </div>
              </div>
              <p className="text-[10px] text-teal-600">※ iDeCo掛金は全額所得控除の対象として税計算に反映されます</p>

              {/* iDeCo Portfolio */}
              <div>
                <label className="text-xs text-teal-900 block font-bold mb-2">iDeCo ポートフォリオ</label>
                <div className="space-y-2 bg-white p-2 rounded border border-teal-100">
                    {profile.ideco.portfolio.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                            <select 
                            className="flex-1 rounded-md border-gray-300 shadow-sm text-xs p-1"
                            value={item.stockId}
                            onChange={(e) => updateIdecoPortfolioItem(role, idx, 'stockId', e.target.value)}
                            >
                            {RAKUTEN_MAJOR_STOCKS.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.rate}%)</option>
                            ))}
                            </select>
                            <input 
                                type="number" 
                                value={item.percentage}
                                onChange={(e) => updateIdecoPortfolioItem(role, idx, 'percentage', Number(e.target.value))}
                                className="w-10 p-1 border rounded text-right text-xs"
                            />
                            <button onClick={() => removeIdecoPortfolioItem(role, idx)} className="text-gray-400 hover:text-red-500">
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    <div className="flex justify-between items-center pt-1">
                        <button onClick={() => addIdecoPortfolioItem(role)} className="text-xs text-teal-600 flex items-center">
                            <PlusCircle className="w-3 h-3 mr-1" /> 追加
                        </button>
                        <span className={`text-xs ${idecoAlloc !== 100 ? 'text-red-500' : 'text-gray-500'}`}>合計 {idecoAlloc}%</span>
                    </div>
                </div>
              </div>

              {/* iDeCo Contribution */}
              <div>
                  <label className="block text-xs font-medium text-teal-900 mb-2">iDeCo 掛金計画</label>
                  {profile.ideco.contributionPeriods.map((period) => (
                      <div key={period.id} className="bg-white p-2 rounded mb-2 border border-teal-100">
                          <div className="flex items-center space-x-2 mb-1">
                              <input 
                                  type="month" 
                                  value={period.startMonth}
                                  onChange={(e) => updateIdecoPeriod(role, period.id, 'startMonth', e.target.value)}
                                  className="text-xs border rounded p-1 w-24"
                              />
                              <span className="text-xs text-gray-500">~</span>
                              <input 
                                  type="month" 
                                  value={period.endMonth}
                                  onChange={(e) => updateIdecoPeriod(role, period.id, 'endMonth', e.target.value)}
                                  className="text-xs border rounded p-1 w-24"
                              />
                          </div>
                          <div className="flex items-center space-x-2">
                              <input 
                                  type="number"
                                  value={period.amount}
                                  onChange={(e) => updateIdecoPeriod(role, period.id, 'amount', Number(e.target.value))}
                                  className="flex-1 text-sm border rounded p-1 text-right"
                              />
                              <span className="text-xs text-gray-500">円</span>
                              <button onClick={() => removeIdecoPeriod(role, period.id)} className="text-red-400">
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  ))}
                  <button onClick={() => addIdecoPeriod(role)} className="text-xs text-teal-600 flex items-center font-medium">
                      <PlusCircle className="w-3 h-3 mr-1" /> 期間を追加
                  </button>
              </div>
          </div>
      </section>

      {/* Insurance Section */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center text-purple-700">
          <ShieldPlus className="w-4 h-4 mr-1" /> 変額保険 (ソニー生命など)
        </h3>
        <div className="space-y-4">
           {profile.insuranceProducts.map(product => (
               <div key={product.id} className="bg-purple-50 border border-purple-100 p-3 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                     <select 
                       className="block w-full rounded-md border-purple-200 shadow-sm text-sm p-1 bg-white mr-2"
                       value={product.name}
                       onChange={(e) => applyInsurancePreset(role, product.id, e.target.value)}
                     >
                       <option value={product.name}>{product.name}</option>
                       {INSURANCE_PRESETS.map(p => (
                         p.name !== product.name && <option key={p.name} value={p.name}>{p.name}</option>
                       ))}
                     </select>
                     <button onClick={() => removeInsurance(role, product.id)} className="text-red-400 hover:text-red-600">
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                     <div className="col-span-2">
                        <label className="text-xs text-purple-900 block font-bold mb-1">現在の解約返戻金 記録日</label>
                        <input
                           type="date"
                           value={product.recordedDate || new Date().toISOString().split('T')[0]}
                           onChange={(e) => updateInsurance(role, product.id, 'recordedDate', e.target.value)}
                           className="w-full rounded border-purple-200 text-sm p-1"
                        />
                     </div>
                     <div>
                        <label className="text-xs text-purple-900 block">現在の解約返戻金</label>
                        <input
                           type="number"
                           value={product.currentCashValue}
                           onChange={(e) => updateInsurance(role, product.id, 'currentCashValue', Number(e.target.value))}
                           className="w-full rounded border-purple-200 text-right text-sm p-1"
                        />
                     </div>
                     <div>
                        <label className="text-xs text-purple-900 block">累計払込保険料(元本)</label>
                         <input
                           type="number"
                           value={product.totalPremiumsPaid}
                           onChange={(e) => updateInsurance(role, product.id, 'totalPremiumsPaid', Number(e.target.value))}
                           className="w-full rounded border-purple-200 text-right text-sm p-1"
                        />
                     </div>
                     <div>
                        <label className="text-xs text-purple-900 block">月額保険料</label>
                        <input
                           type="number"
                           value={product.monthlyPremium}
                           onChange={(e) => updateInsurance(role, product.id, 'monthlyPremium', Number(e.target.value))}
                           className="w-full rounded border-purple-200 text-right text-sm p-1"
                        />
                     </div>
                     <div>
                        <label className="text-xs text-purple-900 block">想定リターン(%)</label>
                        <input
                           type="number"
                           step="0.1"
                           value={product.expectedReturnRate}
                           onChange={(e) => updateInsurance(role, product.id, 'expectedReturnRate', Number(e.target.value))}
                           className="w-full rounded border-purple-200 text-right text-sm p-1"
                        />
                     </div>
                     <div>
                        <label className="text-xs text-purple-900 block">払込終了年齢</label>
                        <input
                           type="number"
                           value={product.paymentEndAge}
                           onChange={(e) => updateInsurance(role, product.id, 'paymentEndAge', Number(e.target.value))}
                           className="w-full rounded border-purple-200 text-right text-sm p-1"
                        />
                     </div>
                  </div>
                  <p className="text-[10px] text-purple-700">※ 積立は記録日の翌月から開始されます</p>
               </div>
           ))}
           <button onClick={() => addInsurance(role)} className="mt-2 flex items-center text-xs text-purple-600 hover:text-purple-800 font-medium">
              <PlusCircle className="w-3 h-3 mr-1" /> 保険商品を追加する
           </button>
        </div>
      </section>

      {/* Withdrawal & Pension */}
      <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1" /> 老後プラン (取り崩し・年金)
        </h3>
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">年金受取開始</label>
                <div className="relative">
                  <input
                    type="number"
                    value={profile.pensionStartAge}
                    onChange={(e) => updatePerson(role, 'pensionStartAge', Number(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 border p-2 text-right"
                  />
                  <span className="absolute right-8 top-2 text-gray-400 text-sm">歳</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">年金受取額(月)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={profile.monthlyPension}
                    onChange={(e) => updatePerson(role, 'monthlyPension', Number(e.target.value))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 border p-2 text-right pr-2"
                  />
                </div>
              </div>
           </div>
           
           <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-end mb-1">
                 <label className="block text-xs font-medium text-gray-700">生活費など必要額(月)</label>
                 <span className="text-xs text-gray-400">{profile.withdrawalStartAge}歳〜</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                 <input
                    type="number"
                    value={profile.withdrawalStartAge}
                    onChange={(e) => updatePerson(role, 'withdrawalStartAge', Number(e.target.value))}
                    className="w-16 rounded-md border-gray-300 bg-gray-50 border p-2 text-right text-sm"
                 />
                 <span className="text-xs">歳から</span>
                 <div className="relative flex-1">
                    <input
                        type="number"
                        value={profile.monthlyWithdrawal}
                        onChange={(e) => updatePerson(role, 'monthlyWithdrawal', Number(e.target.value))}
                        step={10000}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 border p-2 text-right pr-12"
                    />
                    <span className="absolute right-3 top-2 text-gray-500 text-sm">円</span>
                 </div>
              </div>
              <p className="text-xs text-gray-500">
                ※ 年金不足分は 保険 → iDeCo → NISA の順に充当されます
              </p>
           </div>
        </div>
      </section>
    </div>
    );
  };

  const renderFamilyConfig = () => (
    <div className="space-y-6 animate-fadeIn">
       <section>
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
          <Gift className="w-4 h-4 mr-1" /> 子への暦年贈与・結婚資金贈与
        </h3>
        
        <div className="space-y-4">
           {/* Child List */}
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div className="flex justify-between items-center mb-2">
                 <label className="block text-sm font-medium text-gray-700">子供リスト ({state.family.children.length}人)</label>
                 <button onClick={addChild} className="text-xs text-blue-600 flex items-center font-bold">
                    <PlusCircle className="w-3 h-3 mr-1" /> 追加
                 </button>
               </div>
               
               <div className="space-y-2">
                   {state.family.children.length === 0 && <p className="text-xs text-gray-400 text-center py-2">子供が登録されていません</p>}
                   {state.family.children.map((child) => (
                       <div key={child.id} className="flex items-center space-x-2 bg-white p-2 rounded shadow-sm border border-gray-200">
                          <input 
                            type="text" 
                            value={child.name} 
                            onChange={(e) => updateChild(child.id, 'name', e.target.value)}
                            className="text-xs p-1 border rounded w-1/3"
                            placeholder="名前"
                          />
                          <input 
                            type="date"
                            value={child.birthDate}
                            onChange={(e) => updateChild(child.id, 'birthDate', e.target.value)}
                            className="text-xs p-1 border rounded flex-1"
                          />
                          <button onClick={() => removeChild(child.id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                   ))}
               </div>
           </div>

           {state.family.children.length > 0 && (
            <div className="space-y-6">
                
                {/* Annual Gift */}
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4">
                   <h4 className="text-xs font-bold text-blue-800 uppercase">暦年贈与 (毎年)</h4>
                   <div>
                      <label className="block text-sm font-medium text-blue-900 mb-1">1人あたりの年間贈与額</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={state.family.giftAnnualAmountPerChild}
                          onChange={(e) => onChange({ ...state, family: { ...state.family, giftAnnualAmountPerChild: Number(e.target.value) }})}
                          step={100000}
                          className="block w-full rounded-md border-blue-200 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white border p-2 text-right pr-12"
                        />
                        <span className="absolute right-3 top-2 text-blue-500 text-sm">円</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">※ 通常、年間110万円までは贈与税がかかりません</p>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-blue-900 mb-1">開始 (夫の年齢)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={state.family.giftStartAge}
                            onChange={(e) => onChange({ ...state, family: { ...state.family, giftStartAge: Number(e.target.value) }})}
                            className="block w-full rounded-md border-blue-200 bg-white border p-2 text-right"
                          />
                          <span className="absolute right-8 top-2 text-blue-400 text-sm">歳</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-blue-900 mb-1">終了 (夫の年齢)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={state.family.giftEndAge}
                            onChange={(e) => onChange({ ...state, family: { ...state.family, giftEndAge: Number(e.target.value) }})}
                            className="block w-full rounded-md border-blue-200 bg-white border p-2 text-right"
                          />
                          <span className="absolute right-8 top-2 text-blue-400 text-sm">歳</span>
                        </div>
                      </div>
                   </div>
                </div>
                
                {/* Marriage Gift */}
                <div className="bg-pink-50 p-4 rounded-xl border border-pink-100 space-y-4">
                   <h4 className="text-xs font-bold text-pink-800 uppercase">結婚資金贈与 (一時金)</h4>
                   
                   <div>
                      <label className="block text-sm font-medium text-pink-900 mb-1">1人あたりの贈与額</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={state.family.marriageGiftAmountPerChild}
                          onChange={(e) => onChange({ ...state, family: { ...state.family, marriageGiftAmountPerChild: Number(e.target.value) }})}
                          step={500000}
                          className="block w-full rounded-md border-pink-200 shadow-sm focus:border-pink-500 focus:ring-pink-500 bg-white border p-2 text-right pr-12"
                        />
                        <span className="absolute right-3 top-2 text-pink-500 text-sm">円</span>
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-medium text-pink-900 mb-1">渡すタイミング (子供の年齢)</label>
                      <div className="relative">
                        <input
                          type="number"
                          value={state.family.childMarriageAge}
                          onChange={(e) => onChange({ ...state, family: { ...state.family, childMarriageAge: Number(e.target.value) }})}
                          className="block w-24 rounded-md border-pink-200 bg-white border p-2 text-right"
                        />
                        <span className="absolute right-8 top-2 text-pink-400 text-sm">歳</span>
                      </div>
                      <p className="text-xs text-pink-600 mt-1">※ 登録された各子供の誕生日に応じて自動計算されます</p>
                   </div>
                </div>

                <div className="pt-2 border-t border-gray-200 mt-2">
                     <p className="text-xs text-gray-500 text-center mb-1">
                        資産の均等化機能
                     </p>
                     <p className="text-xs text-gray-400 text-center">
                        ※ 贈与資金は、資産の多い方の親から優先的に取り崩され、夫婦の資産額が均等になるよう自動調整されます。
                     </p>
                </div>

            </div>
          )}
        </div>
       </section>

       {/* Housing Loan Section */}
       <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
             <Home className="w-4 h-4 mr-1" /> 住宅ローン・住居費
          </h3>
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 space-y-4">
             <div className="flex items-center mb-2">
                <input
                   type="checkbox"
                   checked={state.family.housing.hasLoan}
                   onChange={(e) => onChange({ ...state, family: { ...state.family, housing: { ...state.family.housing, hasLoan: e.target.checked } } })}
                   className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm font-bold text-indigo-900">
                    住宅ローンを利用している
                </label>
             </div>

             {state.family.housing.hasLoan && (
                 <div className="space-y-4 animate-fadeIn">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-indigo-900 mb-1">現在のローン残高</label>
                            <input
                                type="number"
                                value={state.family.housing.loanBalance}
                                onChange={(e) => onChange({ ...state, family: { ...state.family, housing: { ...state.family.housing, loanBalance: Number(e.target.value) } } })}
                                className="block w-full rounded-md border-indigo-200 bg-white p-2 text-right"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-indigo-900 mb-1">金利 (年%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={state.family.housing.interestRate}
                                onChange={(e) => onChange({ ...state, family: { ...state.family, housing: { ...state.family.housing, interestRate: Number(e.target.value) } } })}
                                className="block w-full rounded-md border-indigo-200 bg-white p-2 text-right"
                            />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-medium text-indigo-900 mb-1">毎月の返済額 (元利込)</label>
                            <input
                                type="number"
                                value={state.family.housing.monthlyPayment}
                                onChange={(e) => onChange({ ...state, family: { ...state.family, housing: { ...state.family.housing, monthlyPayment: Number(e.target.value) } } })}
                                className="block w-full rounded-md border-indigo-200 bg-white p-2 text-right"
                            />
                        </div>
                         <div>
                            <label className="block text-xs font-medium text-indigo-900 mb-1">ボーナス返済 (年額)</label>
                            <input
                                type="number"
                                value={state.family.housing.bonusPayment}
                                onChange={(e) => onChange({ ...state, family: { ...state.family, housing: { ...state.family.housing, bonusPayment: Number(e.target.value) } } })}
                                className="block w-full rounded-md border-indigo-200 bg-white p-2 text-right"
                            />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-indigo-900 mb-1">完済予定年月</label>
                            <input
                                type="month"
                                value={state.family.housing.paymentEndDate}
                                onChange={(e) => onChange({ ...state, family: { ...state.family, housing: { ...state.family.housing, paymentEndDate: e.target.value } } })}
                                className="block w-full rounded-md border-indigo-200 bg-white p-2"
                            />
                        </div>
                        <div>
                             <label className="block text-xs font-medium text-indigo-900 mb-1">ローン控除 終了年月</label>
                            <input
                                type="month"
                                value={state.family.housing.deductionEndDate}
                                onChange={(e) => onChange({ ...state, family: { ...state.family, housing: { ...state.family.housing, deductionEndDate: e.target.value } } })}
                                className="block w-full rounded-md border-indigo-200 bg-white p-2"
                            />
                        </div>
                     </div>
                 </div>
             )}
             
             {/* Maintenance Fees are relevant even without loan (e.g. condo fees) but usually associated with ownership */}
             <div className="pt-2 border-t border-indigo-200">
                <label className="block text-xs font-medium text-indigo-900 mb-1">
                   {state.family.housing.hasLoan ? "管理費・修繕積立金・固定資産税 (月換算)" : "住居費 (家賃・管理費等)"}
                </label>
                <div className="relative">
                    <input
                        type="number"
                        value={state.family.housing.monthlyMaintenanceFee}
                        onChange={(e) => onChange({ ...state, family: { ...state.family, housing: { ...state.family.housing, monthlyMaintenanceFee: Number(e.target.value) } } })}
                        className="block w-full rounded-md border-indigo-200 bg-white p-2 text-right pr-12"
                    />
                    <span className="absolute right-3 top-2 text-indigo-500 text-sm">円</span>
                </div>
             </div>
          </div>
       </section>

       {/* Fixed Cost Section */}
       <section>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center">
             <Wallet className="w-4 h-4 mr-1" /> 生活固定費 (内訳管理)
          </h3>
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
             <div className="space-y-3">
                 <p className="text-xs text-gray-500 mb-2">
                     住居費以外の固定費を入力してください。(食費・光熱費・保険・税金など)
                 </p>
                 {state.family.fixedCosts.map((item) => (
                     <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white p-2 rounded shadow-sm border border-gray-200">
                         <div className="flex-1">
                             <input 
                               type="text"
                               value={item.name}
                               onChange={(e) => updateFixedCost(item.id, 'name', e.target.value)}
                               className="block w-full rounded-md border-gray-300 shadow-sm text-xs p-2"
                               placeholder="項目名 (例: 食費)"
                             />
                         </div>
                         <div className="flex items-center gap-2">
                             <div className="relative w-32">
                                <input
                                    type="number"
                                    value={item.amount}
                                    onChange={(e) => updateFixedCost(item.id, 'amount', Number(e.target.value))}
                                    className="block w-full rounded-md border-gray-300 shadow-sm text-xs p-2 text-right pr-8"
                                />
                                <span className="absolute right-2 top-2 text-gray-500 text-xs">円</span>
                             </div>
                             <select
                                value={item.frequency}
                                onChange={(e) => updateFixedCost(item.id, 'frequency', e.target.value)}
                                className="rounded-md border-gray-300 shadow-sm text-xs p-2 w-20"
                             >
                                <option value="monthly">毎月</option>
                                <option value="yearly">毎年</option>
                             </select>
                             <button onClick={() => removeFixedCost(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                                <Trash2 className="w-4 h-4" />
                             </button>
                         </div>
                     </div>
                 ))}
                 <button onClick={addFixedCost} className="text-xs text-blue-600 flex items-center font-bold mt-2">
                    <PlusCircle className="w-3 h-3 mr-1" /> 固定費を追加
                 </button>
             </div>
          </div>
       </section>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 h-full overflow-hidden flex flex-col">
      {/* Save/Load Header */}
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex space-x-2">
         <button onClick={handleSave} className="flex-1 flex items-center justify-center text-xs bg-white border border-gray-300 rounded p-2 hover:bg-gray-100 text-gray-700">
             <Save className="w-4 h-4 mr-1" /> 保存(JSON)
         </button>
         <button onClick={handleLoadClick} className="flex-1 flex items-center justify-center text-xs bg-white border border-gray-300 rounded p-2 hover:bg-gray-100 text-gray-700">
             <Upload className="w-4 h-4 mr-1" /> 読込(JSON)
         </button>
         <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".json"
         />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100">
         <button 
           onClick={() => setActiveTab('husband')}
           className={`flex-1 py-3 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'husband' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <User className="w-4 h-4 mr-2" /> 夫
         </button>
         <button 
           onClick={() => setActiveTab('wife')}
           className={`flex-1 py-3 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'wife' ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50/50' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <Heart className="w-4 h-4 mr-2" /> 妻
         </button>
         <button 
           onClick={() => setActiveTab('family')}
           className={`flex-1 py-3 text-sm font-medium flex items-center justify-center transition-colors ${activeTab === 'family' ? 'text-green-600 border-b-2 border-green-600 bg-green-50/50' : 'text-gray-500 hover:text-gray-700'}`}
         >
           <Users className="w-4 h-4 mr-2" /> 家族/住居
         </button>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 overflow-y-auto flex-1">
         {activeTab === 'husband' && renderPersonConfig('husband', state.husband)}
         {activeTab === 'wife' && renderPersonConfig('wife', state.wife)}
         {activeTab === 'family' && renderFamilyConfig()}
      </div>
    </div>
  );
};

export default SimulationConfig;
