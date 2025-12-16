
import { StockPreset, SimulationState, PersonProfile, InsuranceProduct, ContributionPeriod, IdecoProfile } from './types';

export const MAX_LIFETIME_CONTRIBUTION = 18_000_000; // 18 Million JPY

export const RAKUTEN_MAJOR_STOCKS: StockPreset[] = [
  {
    id: 'emaxis-all-country',
    name: 'eMAXIS Slim 全世界株式 (オール・カントリー)',
    rate: 6.0,
    riskLevel: 'Medium'
  },
  {
    id: 'emaxis-sp500',
    name: 'eMAXIS Slim 米国株式 (S&P500)',
    rate: 7.5,
    riskLevel: 'High'
  },
  {
    id: 'rakuten-vti',
    name: '楽天・全米株式インデックス・ファンド (楽天VTI)',
    rate: 7.2,
    riskLevel: 'High'
  },
  {
    id: 'rakuten-plus',
    name: '楽天・プラス (バランス型)',
    rate: 3.5,
    riskLevel: 'Low'
  },
  {
    id: 'rakuten-nasdaq',
    name: '楽天・NASDAQ-100',
    rate: 9.0,
    riskLevel: 'High'
  },
  {
    id: 'conservative',
    name: '国内債券・保守的運用',
    rate: 1.5,
    riskLevel: 'Low'
  }
];

export const INSURANCE_PRESETS: Partial<InsuranceProduct>[] = [
  { name: 'ソニー生命 変額・世界株式型 (GQ)', expectedReturnRate: 7.0 },
  { name: 'ソニー生命 変額・世界コア株式 (GI)', expectedReturnRate: 5.0 },
  { name: 'ソニー生命 変額・債券型', expectedReturnRate: 2.0 },
  { name: 'その他・変額保険 (積極運用)', expectedReturnRate: 6.0 },
];

const today = new Date();
const currentYear = today.getFullYear();
const defaultBirthYear = currentYear - 30;
const defaultDateStr = `${defaultBirthYear}-01-01`;
const todayStr = today.toISOString().split('T')[0];

const nextMonth = new Date(currentYear, today.getMonth() + 1, 1);
const endInitPeriod = new Date(currentYear + 20, 11, 31); // 20 years default
const endIdecoPeriod = new Date(currentYear + 30, 11, 31); // 30 years default

const defaultStartMonth = `${nextMonth.getFullYear()}-${(nextMonth.getMonth() + 1).toString().padStart(2, '0')}`;
const defaultEndMonth = `${endInitPeriod.getFullYear()}-${(endInitPeriod.getMonth() + 1).toString().padStart(2, '0')}`;
const defaultIdecoEndMonth = `${endIdecoPeriod.getFullYear()}-${(endIdecoPeriod.getMonth() + 1).toString().padStart(2, '0')}`;

const DEFAULT_IDECO: IdecoProfile = {
  assetDataDate: todayStr,
  currentPrincipal: 0,
  currentProfit: 0,
  contributionPeriods: [
    { 
      id: 'ideco-init', 
      startMonth: defaultStartMonth, 
      endMonth: defaultIdecoEndMonth, 
      amount: 23000 // Typical limit for corporate employees
    }
  ],
  portfolio: [
    { stockId: 'emaxis-all-country', percentage: 100 }
  ]
};

const DEFAULT_PROFILE: PersonProfile = {
  name: '',
  birthDate: defaultDateStr,
  withdrawalStartAge: 65,
  pensionStartAge: 65,
  monthlyPension: 150000,
  assetDataDate: todayStr,
  currentPrincipal: 1000000,
  currentProfit: 100000,
  
  incomePeriods: [
    { id: 'inc1', startAge: 22, endAge: 60, amount: 5000000 },
    { id: 'inc2', startAge: 61, endAge: 65, amount: 3000000 },
  ],
  furusatoNozeiAmount: 50000, // Default 50k donation

  giftReceivingPeriods: [], // Received from parents

  contributionPeriods: [
    { 
      id: 'init', 
      startMonth: defaultStartMonth, 
      endMonth: defaultEndMonth, 
      amount: 50000 
    }
  ],
  
  bonusContributions: [],
  portfolio: [
    { stockId: 'emaxis-all-country', percentage: 100 }
  ],
  
  ideco: { ...DEFAULT_IDECO },

  monthlyWithdrawal: 200000,
  insuranceProducts: []
};

export const INITIAL_STATE: SimulationState = {
  husband: { 
    ...DEFAULT_PROFILE, 
    name: '夫', 
    birthDate: `${currentYear - 32}-01-01`,
    incomePeriods: [
        { id: 'h1', startAge: 25, endAge: 60, amount: 6000000 },
        { id: 'h2', startAge: 61, endAge: 65, amount: 3000000 }
    ],
    furusatoNozeiAmount: 80000
  },
  wife: { 
    ...DEFAULT_PROFILE, 
    name: '妻', 
    birthDate: `${currentYear - 30}-01-01`, 
    contributionPeriods: [
       { id: 'w1', startMonth: defaultStartMonth, endMonth: defaultEndMonth, amount: 30000 }
    ],
    monthlyPension: 80000,
    incomePeriods: [
        { id: 'w1', startAge: 25, endAge: 55, amount: 4000000 },
        { id: 'w2', startAge: 56, endAge: 65, amount: 1000000 }
    ],
    furusatoNozeiAmount: 30000
  },
  family: {
    giftAnnualAmountPerChild: 1100000, // 1.1 Million JPY default
    giftStartAge: 60, // Husband's age
    giftEndAge: 75,
    marriageGiftAmountPerChild: 3000000, // 3 Million JPY
    childMarriageAge: 30,
    children: [
      { id: '1', name: '長子', birthDate: `${currentYear - 5}-01-01` },
      { id: '2', name: '次子', birthDate: `${currentYear - 3}-01-01` }
    ],
    housing: {
      hasLoan: false,
      loanBalance: 30000000,
      interestRate: 0.6,
      monthlyPayment: 100000,
      bonusPayment: 0,
      paymentEndDate: `${currentYear + 25}-12`,
      deductionEndDate: `${currentYear + 10}-12`,
      deductionRate: 0.7,
      monthlyMaintenanceFee: 30000
    },
    fixedCosts: [
      { id: 'fc1', name: '基本生活費 (食費・日用品)', amount: 150000, frequency: 'monthly' },
      { id: 'fc2', name: '水道光熱費・通信費', amount: 30000, frequency: 'monthly' },
      { id: 'fc3', name: '車両維持費 (保険・税金)', amount: 100000, frequency: 'yearly' }
    ]
  }
};
