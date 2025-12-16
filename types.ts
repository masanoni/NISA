
export interface StockPreset {
  id: string;
  name: string;
  rate: number; // Annual return rate in percentage (e.g., 5.0)
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface PortfolioAllocation {
  stockId: string;
  percentage: number; // 0-100
}

export interface ContributionPeriod {
  id: string;
  startMonth: string; // YYYY-MM
  endMonth: string;   // YYYY-MM
  amount: number;     // Monthly amount
}

export interface IncomePeriod {
  id: string;
  startAge: number;
  endAge: number;
  amount: number; // Annual Gross Income (Ten-man yen usually, but here assume raw JPY)
}

export interface BonusContribution {
  id: string;
  age: number; // The age at which this lump sum is invested
  amount: number; // Amount in JPY
}

export interface InsuranceProduct {
  id: string;
  name: string;
  recordedDate: string; // YYYY-MM-DD (Date when the current value was checked)
  monthlyPremium: number;
  totalPremiumsPaid: number; // The principal invested so far
  currentCashValue: number;
  expectedReturnRate: number;
  paymentEndAge: number; // Age at which premium payments stop
}

export interface IdecoProfile {
  assetDataDate: string;
  currentPrincipal: number;
  currentProfit: number;
  contributionPeriods: ContributionPeriod[];
  portfolio: PortfolioAllocation[];
}

export interface PersonProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  withdrawalStartAge: number;
  pensionStartAge: number;
  monthlyPension: number; // Monthly pension receipt
  
  // Income
  incomePeriods: IncomePeriod[];

  // NISA
  assetDataDate: string; // YYYY-MM-DD (Date when the current principal/profit was recorded)
  currentPrincipal: number;
  currentProfit: number; // Used for the "Now" snapshot
  contributionPeriods: ContributionPeriod[]; // NISA Contributions
  bonusContributions: BonusContribution[];
  portfolio: PortfolioAllocation[];
  
  // iDeCo
  ideco: IdecoProfile;

  // Insurance
  insuranceProducts: InsuranceProduct[];

  // Withdrawal
  monthlyWithdrawal: number; // Target monthly living cost to pull from this person's assets
}

export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
}

export interface HousingLoanProfile {
  hasLoan: boolean;
  loanBalance: number; // Current Balance
  interestRate: number; // Annual %
  monthlyPayment: number; // Principal + Interest
  bonusPayment: number; // Annual total bonus payment
  paymentEndDate: string; // YYYY-MM
  
  deductionEndDate: string; // YYYY-MM (When the tax deduction ends)
  deductionRate: number; // 0.7% usually
  
  monthlyMaintenanceFee: number; // Management fee + Repair reserve + Tax (monthly avg)
}

export interface FamilySettings {
  // Annual Gift (Rekinen Zoyo)
  giftAnnualAmountPerChild: number; // Annual gift tax exemption (usually 1.1M)
  giftStartAge: number; // Based on Husband's age
  giftEndAge: number; // Based on Husband's age

  // Marriage Gift
  marriageGiftAmountPerChild: number;
  childMarriageAge: number; // Age of child when they receive the gift
  
  children: ChildProfile[];

  // Housing
  housing: HousingLoanProfile;
}

export interface SimulationState {
  husband: PersonProfile;
  wife: PersonProfile;
  family: FamilySettings;
}

export interface SimulationResultYear {
  yearIndex: number; // 0, 1, 2...
  calendarYear: number; // 2024, 2025...
  husbandAge: number;
  wifeAge: number;
  
  // Cash Flow Stats
  h_grossIncome: number;
  w_grossIncome: number;
  household_grossIncome: number;
  household_taxAndSocial: number; // Sum of Tax + Social Ins
  household_takeHome: number; // Gross - Tax/Social
  
  annual_housing_cost: number; // Loan + Maintenance
  annual_housing_deduction: number; // Tax Credit amount
  
  household_disposable_after_fixed: number; // TakeHome - Housing - Investments
  
  // Husband Stats Breakdown
  h_nisaPrincipal: number;
  h_nisaProfit: number;
  h_nisaAssets: number;
  
  h_idecoPrincipal: number;
  h_idecoProfit: number;
  h_idecoAssets: number;

  h_insPrincipal: number;
  h_insProfit: number;
  h_insuranceAssets: number; // Total Value

  h_totalAssets: number;
  h_isMaxed: boolean;
  h_totalAnnualContribution: number; // Total paid this year (NISA+iDeCo+Ins)

  // Wife Stats Breakdown
  w_nisaPrincipal: number;
  w_nisaProfit: number;
  w_nisaAssets: number;

  w_idecoPrincipal: number;
  w_idecoProfit: number;
  w_idecoAssets: number;
  
  w_insPrincipal: number;
  w_insProfit: number;
  w_insuranceAssets: number; // Total Value

  w_totalAssets: number;
  w_isMaxed: boolean;
  w_totalAnnualContribution: number; // Total paid this year (NISA+iDeCo+Ins)

  // Household Stats
  totalHouseholdAssets: number;
  totalHouseholdPrincipal: number; // Sum of all Principals
  totalRoi: number; // Return on Investment %
  cumulativeGifts: number; // Total amount transferred to children
  
  // Income/Flow
  totalPension: number;
}
