
import { SimulationState, SimulationResultYear, PersonProfile, InsuranceProduct, PortfolioAllocation, ContributionPeriod, IdecoProfile, IncomePeriod } from '../types';
import { MAX_LIFETIME_CONTRIBUTION, RAKUTEN_MAJOR_STOCKS } from '../constants';

// --- Helper Functions ---

const growAsset = (amount: number, monthlyRate: number) => {
  return amount * (1 + monthlyRate);
};

// Calculate age based on birth year and target year
const getAge = (birthDate: string, targetYear: number): number => {
  if (!birthDate) return 0;
  const birthYear = parseInt(birthDate.split('-')[0]);
  return targetYear - birthYear;
};

// Parse YYYY-MM-DD to get Year and Month (1-12)
const parseDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
};

// Check contribution amount for a specific YYYY, MM based on periods
const getContributionForDate = (periods: ContributionPeriod[], year: number, month: number): number => {
  const currentStr = `${year}-${month.toString().padStart(2, '0')}`;
  const period = periods.find(p => currentStr >= p.startMonth && currentStr <= p.endMonth);
  return period ? period.amount : 0;
};

const getIncomeForAge = (periods: IncomePeriod[], age: number): number => {
  const period = periods.find(p => age >= p.startAge && age <= p.endAge);
  return period ? period.amount : 0;
};

// Simplified Tax Calculation (Japan)
// Returns { tax, socialInsurance, takeHome }
const calculateAnnualTax = (grossIncome: number, housingDeduction: number = 0, idecoContribution: number = 0) => {
  if (grossIncome <= 0) return { tax: 0, social: 0, takeHome: 0 };

  // 1. Social Insurance (Approx 14.4% roughly + Emp insurance) -> simplified to ~15% for simulation
  const socialInsurance = grossIncome * 0.15;

  // 2. Income Tax
  let incomeDeduction = 0;
  if (grossIncome <= 1625000) incomeDeduction = 550000;
  else if (grossIncome <= 1800000) incomeDeduction = grossIncome * 0.4 - 100000;
  else if (grossIncome <= 3600000) incomeDeduction = grossIncome * 0.3 + 80000;
  else if (grossIncome <= 6600000) incomeDeduction = grossIncome * 0.2 + 440000;
  else if (grossIncome <= 8500000) incomeDeduction = grossIncome * 0.1 + 1100000;
  else incomeDeduction = 1950000; 

  let taxableIncome = grossIncome - incomeDeduction - socialInsurance - 480000 - idecoContribution; 
  if (taxableIncome < 0) taxableIncome = 0;

  let incomeTax = 0;
  if (taxableIncome <= 1950000) incomeTax = taxableIncome * 0.05;
  else if (taxableIncome <= 3300000) incomeTax = taxableIncome * 0.10 - 97500;
  else if (taxableIncome <= 6950000) incomeTax = taxableIncome * 0.20 - 427500;
  else if (taxableIncome <= 9000000) incomeTax = taxableIncome * 0.23 - 636000;
  else if (taxableIncome <= 18000000) incomeTax = taxableIncome * 0.33 - 1536000;
  else incomeTax = taxableIncome * 0.40 - 2796000;

  // Apply Housing Deduction to Income Tax
  let appliedHousingDed = 0;
  if (housingDeduction > 0) {
      if (incomeTax >= housingDeduction) {
          incomeTax -= housingDeduction;
          appliedHousingDed = housingDeduction;
      } else {
          // Remainder check for Resident Tax (Limited to 97,500 JPY approx)
          const remainder = housingDeduction - incomeTax;
          incomeTax = 0;
          appliedHousingDed = housingDeduction; 
      }
  }

  // 3. Resident Tax (Approx 10% of Taxable Income)
  let residentTax = taxableIncome * 0.10 + 5000; 
  
  if (housingDeduction > appliedHousingDed || (housingDeduction > 0 && incomeTax === 0)) {
     if (incomeTax === 0) {
        residentTax = Math.max(0, residentTax - 97500);
     }
  }

  const totalTax = incomeTax + residentTax;
  const takeHome = grossIncome - socialInsurance - totalTax;

  return { 
      tax: totalTax, 
      social: socialInsurance, 
      takeHome: Math.max(0, takeHome),
      deductionEffect: appliedHousingDed 
  };
};

export const getWeightedReturnRate = (portfolio: PortfolioAllocation[]): number => {
  let totalRate = 0;
  let totalPercent = 0;

  portfolio.forEach(item => {
    const stock = RAKUTEN_MAJOR_STOCKS.find(s => s.id === item.stockId);
    const rate = stock ? stock.rate : 0;
    totalRate += rate * (item.percentage / 100);
    totalPercent += item.percentage;
  });

  return totalRate; 
};

// --- Withdrawal Helper ---
// Attempts to withdraw `amount` from the assets in order: Insurance -> iDeCo (if age >= 60) -> NISA
// Modifies the passed state objects.
// Returns the amount actually withdrawn.
const withdrawFromAssets = (
    amount: number,
    age: number,
    insProducts: InsuranceProduct[],
    ideco: { principal: number, assets: number },
    nisa: { principal: number, assets: number }
): number => {
    let remaining = amount;
    let withdrawn = 0;

    // 1. Insurance
    const totalInsAssets = insProducts.reduce((sum, p) => sum + p.currentCashValue, 0);
    if (remaining > 0 && totalInsAssets > 0) {
        const take = Math.min(totalInsAssets, remaining);
        if (take > 0) {
            const ratio = (totalInsAssets - take) / totalInsAssets;
            insProducts.forEach(p => {
                p.currentCashValue *= ratio;
                p.totalPremiumsPaid *= ratio;
            });
            remaining -= take;
            withdrawn += take;
        }
    }

    // 2. iDeCo (Only if age >= 60)
    if (remaining > 0 && age >= 60 && ideco.assets > 0) {
        const take = Math.min(ideco.assets, remaining);
        if (take > 0) {
             const ratio = (ideco.assets - take) / ideco.assets;
             ideco.principal *= ratio;
             ideco.assets -= take;
             remaining -= take;
             withdrawn += take;
        }
    }

    // 3. NISA
    if (remaining > 0 && nisa.assets > 0) {
        const take = Math.min(nisa.assets, remaining);
        if (take > 0) {
            const ratio = (nisa.assets - take) / nisa.assets;
            nisa.principal *= ratio;
            nisa.assets -= take;
            remaining -= take;
            withdrawn += take;
        }
    }

    return withdrawn;
};

// Process NISA/iDeCo/Insurance steps (Growth & Contribution)
const processNisaStep = (principal: number, assets: number, contribution: number, monthlyRate: number) => {
  let nextPrincipal = principal;
  let nextAssets = growAsset(assets, monthlyRate);
  if (nextPrincipal < MAX_LIFETIME_CONTRIBUTION) {
    let actualContrib = contribution;
    if (nextPrincipal + actualContrib > MAX_LIFETIME_CONTRIBUTION) {
      actualContrib = MAX_LIFETIME_CONTRIBUTION - nextPrincipal;
    }
    if (actualContrib > 0) {
      nextPrincipal += actualContrib;
      nextAssets += actualContrib;
    }
  }
  return { nextPrincipal, nextAssets };
};

const processIdecoStep = (principal: number, assets: number, contribution: number, monthlyRate: number) => {
    let nextPrincipal = principal + contribution;
    let nextAssets = growAsset(assets, monthlyRate) + contribution;
    return { nextPrincipal, nextAssets };
};

const processInsuranceStep = (products: InsuranceProduct[], age: number, currentYear: number, currentMonth: number) => {
  let totalValue = 0;
  let totalPrincipal = 0;
  let monthlyTotalPaid = 0;
  
  const nextProducts = products.map(p => {
    let newVal = growAsset(p.currentCashValue, p.expectedReturnRate / 100 / 12);
    let newPrincipal = p.totalPremiumsPaid;
    const rec = parseDate(p.recordedDate);
    const isAfterRecord = (currentYear > rec.year) || (currentYear === rec.year && currentMonth > rec.month);

    if (age < p.paymentEndAge && isAfterRecord) {
      newVal += p.monthlyPremium;
      newPrincipal += p.monthlyPremium;
      monthlyTotalPaid += p.monthlyPremium;
    }
    
    totalValue += newVal;
    totalPrincipal += newPrincipal;
    return { ...p, currentCashValue: newVal, totalPremiumsPaid: newPrincipal };
  });

  return { nextProducts, totalValue, totalPrincipal, monthlyTotalPaid };
};


// --- Main Calculation ---

export const calculateSimulation = (state: SimulationState): SimulationResultYear[] => {
  const results: SimulationResultYear[] = [];
  
  const hData = parseDate(state.husband.assetDataDate);
  const wData = parseDate(state.wife.assetDataDate);
  const hIdecoData = parseDate(state.husband.ideco.assetDataDate);
  const wIdecoData = parseDate(state.wife.ideco.assetDataDate);
  
  let minYear = Math.min(hData.year, wData.year, hIdecoData.year, wIdecoData.year);
  
  [...state.husband.insuranceProducts, ...state.wife.insuranceProducts].forEach(p => {
      const pDate = parseDate(p.recordedDate);
      if (pDate.year < minYear) minYear = pDate.year;
  });

  const startYear = minYear;
  const durationYears = 70;

  // Initial State Setup using objects to pass by reference for withdrawal helper
  let h_Nisa = { principal: state.husband.currentPrincipal, assets: state.husband.currentPrincipal + state.husband.currentProfit };
  let h_Ideco = { principal: state.husband.ideco.currentPrincipal, assets: state.husband.ideco.currentPrincipal + state.husband.ideco.currentProfit };
  let h_InsuranceProducts = state.husband.insuranceProducts.map(p => ({...p}));

  let w_Nisa = { principal: state.wife.currentPrincipal, assets: state.wife.currentPrincipal + state.wife.currentProfit };
  let w_Ideco = { principal: state.wife.ideco.currentPrincipal, assets: state.wife.ideco.currentPrincipal + state.wife.ideco.currentProfit };
  let w_InsuranceProducts = state.wife.insuranceProducts.map(p => ({...p}));
  
  let cumulativeGifts = 0;

  const housing = state.family.housing;
  let loanBalance = housing.hasLoan ? housing.loanBalance : 0;
  const loanEnd = housing.paymentEndDate ? parseDate(housing.paymentEndDate) : { year: 9999, month: 12 };
  const deductionEnd = housing.deductionEndDate ? parseDate(housing.deductionEndDate) : { year: 0, month: 0 };

  if (h_Nisa.principal > MAX_LIFETIME_CONTRIBUTION) h_Nisa.principal = MAX_LIFETIME_CONTRIBUTION;
  if (w_Nisa.principal > MAX_LIFETIME_CONTRIBUTION) w_Nisa.principal = MAX_LIFETIME_CONTRIBUTION;

  // Weighted Rates
  const h_AnnualRate = getWeightedReturnRate(state.husband.portfolio);
  const w_AnnualRate = getWeightedReturnRate(state.wife.portfolio);
  const h_IdecoAnnualRate = getWeightedReturnRate(state.husband.ideco.portfolio);
  const w_IdecoAnnualRate = getWeightedReturnRate(state.wife.ideco.portfolio);

  const h_NisaMonthlyRate = h_AnnualRate / 100 / 12;
  const w_NisaMonthlyRate = w_AnnualRate / 100 / 12;
  const h_IdecoMonthlyRate = h_IdecoAnnualRate / 100 / 12;
  const w_IdecoMonthlyRate = w_IdecoAnnualRate / 100 / 12;
  
  const pushResult = (
      yearIdx: number, 
      year: number, 
      h_YearlyPaid: number, 
      w_YearlyPaid: number,
      cashFlowData: {
          hGross: number,
          wGross: number,
          taxSoc: number,
          takeHome: number,
          housingCost: number,
          housingDed: number,
          fixedCost: number,
          remDisposable: number
      }
    ) => {
    const h_Age = getAge(state.husband.birthDate, year);
    const w_Age = getAge(state.wife.birthDate, year);

    const h_InsVal = h_InsuranceProducts.reduce((sum, p) => sum + p.currentCashValue, 0);
    const h_InsPri = h_InsuranceProducts.reduce((sum, p) => sum + p.totalPremiumsPaid, 0);
    
    const w_InsVal = w_InsuranceProducts.reduce((sum, p) => sum + p.currentCashValue, 0);
    const w_InsPri = w_InsuranceProducts.reduce((sum, p) => sum + p.totalPremiumsPaid, 0);

    const totalHouseholdPrincipal = h_Nisa.principal + w_Nisa.principal + h_InsPri + w_InsPri + h_Ideco.principal + w_Ideco.principal;
    const totalHouseholdAssets = h_Nisa.assets + h_InsVal + w_Nisa.assets + w_InsVal + h_Ideco.assets + w_Ideco.assets;
    
    let totalRoi = 0;
    if (totalHouseholdPrincipal > 0) {
      totalRoi = ((totalHouseholdAssets - totalHouseholdPrincipal) / totalHouseholdPrincipal) * 100;
    }

    const safePrincipal = (principal: number, assets: number) => Math.min(principal, assets);
    const safeProfit = (principal: number, assets: number) => Math.max(0, assets - principal);

    results.push({
      yearIndex: yearIdx,
      calendarYear: year,
      husbandAge: h_Age,
      wifeAge: w_Age,
      
      h_grossIncome: cashFlowData.hGross,
      w_grossIncome: cashFlowData.wGross,
      household_grossIncome: cashFlowData.hGross + cashFlowData.wGross,
      household_taxAndSocial: cashFlowData.taxSoc,
      household_takeHome: cashFlowData.takeHome,
      annual_housing_cost: cashFlowData.housingCost,
      annual_housing_deduction: cashFlowData.housingDed,
      annual_fixed_cost: cashFlowData.fixedCost,
      household_disposable_after_fixed: cashFlowData.remDisposable,

      h_nisaPrincipal: safePrincipal(h_Nisa.principal, h_Nisa.assets),
      h_nisaProfit: safeProfit(h_Nisa.principal, h_Nisa.assets),
      h_nisaAssets: Math.round(h_Nisa.assets),
      
      h_idecoPrincipal: safePrincipal(h_Ideco.principal, h_Ideco.assets),
      h_idecoProfit: safeProfit(h_Ideco.principal, h_Ideco.assets),
      h_idecoAssets: Math.round(h_Ideco.assets),

      h_insPrincipal: safePrincipal(h_InsPri, h_InsVal),
      h_insProfit: safeProfit(h_InsPri, h_InsVal),
      h_insuranceAssets: Math.round(h_InsVal),

      h_totalAssets: Math.round(h_Nisa.assets + h_Ideco.assets + h_InsVal),
      h_isMaxed: h_Nisa.principal >= MAX_LIFETIME_CONTRIBUTION,
      h_totalAnnualContribution: Math.round(h_YearlyPaid),

      w_nisaPrincipal: safePrincipal(w_Nisa.principal, w_Nisa.assets),
      w_nisaProfit: safeProfit(w_Nisa.principal, w_Nisa.assets),
      w_nisaAssets: Math.round(w_Nisa.assets),
      
      w_idecoPrincipal: safePrincipal(w_Ideco.principal, w_Ideco.assets),
      w_idecoProfit: safeProfit(w_Ideco.principal, w_Ideco.assets),
      w_idecoAssets: Math.round(w_Ideco.assets),

      w_insPrincipal: safePrincipal(w_InsPri, w_InsVal),
      w_insProfit: safeProfit(w_InsPri, w_InsVal),
      w_insuranceAssets: Math.round(w_InsVal),

      w_totalAssets: Math.round(w_Nisa.assets + w_Ideco.assets + w_InsVal),
      w_isMaxed: w_Nisa.principal >= MAX_LIFETIME_CONTRIBUTION,
      w_totalAnnualContribution: Math.round(w_YearlyPaid),

      totalHouseholdAssets: Math.round(totalHouseholdAssets),
      totalHouseholdPrincipal: Math.round(totalHouseholdPrincipal),
      totalRoi: parseFloat(totalRoi.toFixed(1)),
      cumulativeGifts: Math.round(cumulativeGifts),
      totalPension: 0, 
    });
  };

  pushResult(0, startYear, 0, 0, { hGross: 0, wGross: 0, taxSoc: 0, takeHome: 0, housingCost: 0, housingDed: 0, fixedCost: 0, remDisposable: 0 });

  for (let yearIdx = 1; yearIdx <= durationYears; yearIdx++) {
    const currentYear = startYear + yearIdx;
    const h_Age = getAge(state.husband.birthDate, currentYear);
    const w_Age = getAge(state.wife.birthDate, currentYear);
    
    let annualPension = 0;
    let h_YearlyPaid = 0;
    let w_YearlyPaid = 0;
    
    const h_Gross = getIncomeForAge(state.husband.incomePeriods, h_Age);
    const w_Gross = getIncomeForAge(state.wife.incomePeriods, w_Age);

    let annualHousingPayment = 0;
    let annualHousingDeduction = 0;
    let h_IdecoTotalYear = 0;
    let w_IdecoTotalYear = 0;

    for (let m = 1; m <= 12; m++) {
      const h_isActive = (currentYear > hData.year) || (currentYear === hData.year && m > hData.month);
      const w_isActive = (currentYear > wData.year) || (currentYear === wData.year && m > wData.month);
      const h_IdecoActive = (currentYear > hIdecoData.year) || (currentYear === hIdecoData.year && m > hIdecoData.month);
      const w_IdecoActive = (currentYear > wIdecoData.year) || (currentYear === wIdecoData.year && m > wIdecoData.month);

      // --- HOUSING LOAN (Amortization) ---
      if (housing.hasLoan && loanBalance > 0) {
         const isBeforeEnd = (currentYear < loanEnd.year) || (currentYear === loanEnd.year && m <= loanEnd.month);
         if (isBeforeEnd) {
            const interest = loanBalance * (housing.interestRate / 100 / 12);
            let principalPart = housing.monthlyPayment - interest;
            if (m === 6 || m === 12) principalPart += (housing.bonusPayment / 2);
            if (principalPart > loanBalance) principalPart = loanBalance;
            loanBalance -= principalPart;
            annualHousingPayment += (housing.monthlyPayment + (m === 6 || m === 12 ? housing.bonusPayment / 2 : 0));
         }
      }
      if (housing.hasLoan) annualHousingPayment += housing.monthlyMaintenanceFee;

      // --- HUSBAND ---
      let h_BonusAmt = 0;
      if (m === 1 && h_isActive && h_Age < state.husband.withdrawalStartAge) {
        const bonuses = state.husband.bonusContributions.filter(b => b.age === h_Age);
        for(const b of bonuses) {
           let amt = b.amount;
           if (h_Nisa.principal + amt > MAX_LIFETIME_CONTRIBUTION) amt = MAX_LIFETIME_CONTRIBUTION - h_Nisa.principal;
           if(amt > 0) { 
               h_Nisa.principal += amt; h_Nisa.assets += amt; h_BonusAmt += amt;
           }
        }
      }

      const h_Contrib = (h_isActive && h_Age < state.husband.withdrawalStartAge) 
         ? getContributionForDate(state.husband.contributionPeriods, currentYear, m) : 0;
      let h_ActualContrib = 0;
      if (h_isActive) {
        const oldPrin = h_Nisa.principal;
        const res = processNisaStep(h_Nisa.principal, h_Nisa.assets, h_Contrib, h_NisaMonthlyRate);
        h_Nisa.principal = res.nextPrincipal; h_Nisa.assets = res.nextAssets;
        h_ActualContrib = h_Nisa.principal - oldPrin;
      }
      
      const h_IdecoContrib = (h_IdecoActive && h_Age < 60) 
         ? getContributionForDate(state.husband.ideco.contributionPeriods, currentYear, m) : 0;
      if (h_IdecoActive) {
          const res = processIdecoStep(h_Ideco.principal, h_Ideco.assets, h_IdecoContrib, h_IdecoMonthlyRate);
          h_Ideco.principal = res.nextPrincipal; h_Ideco.assets = res.nextAssets;
          h_IdecoTotalYear += h_IdecoContrib;
      }

      const h_InsRes = processInsuranceStep(h_InsuranceProducts, h_Age, currentYear, m);
      h_InsuranceProducts = h_InsRes.nextProducts;
      h_YearlyPaid += (h_BonusAmt + h_ActualContrib + (h_IdecoActive ? h_IdecoContrib : 0) + h_InsRes.monthlyTotalPaid);

      // --- WIFE ---
      let w_BonusAmt = 0;
      if (m === 1 && w_isActive && w_Age < state.wife.withdrawalStartAge) {
        const bonuses = state.wife.bonusContributions.filter(b => b.age === w_Age);
        for(const b of bonuses) {
           let amt = b.amount;
           if (w_Nisa.principal + amt > MAX_LIFETIME_CONTRIBUTION) amt = MAX_LIFETIME_CONTRIBUTION - w_Nisa.principal;
           if(amt > 0) { 
               w_Nisa.principal += amt; w_Nisa.assets += amt; w_BonusAmt += amt;
            }
        }
      }

      const w_Contrib = (w_isActive && w_Age < state.wife.withdrawalStartAge) 
         ? getContributionForDate(state.wife.contributionPeriods, currentYear, m) : 0;
      let w_ActualContrib = 0;
      if (w_isActive) {
        const oldPrin = w_Nisa.principal;
        const res = processNisaStep(w_Nisa.principal, w_Nisa.assets, w_Contrib, w_NisaMonthlyRate);
        w_Nisa.principal = res.nextPrincipal; w_Nisa.assets = res.nextAssets;
        w_ActualContrib = w_Nisa.principal - oldPrin;
      }

      const w_IdecoContrib = (w_IdecoActive && w_Age < 60) 
         ? getContributionForDate(state.wife.ideco.contributionPeriods, currentYear, m) : 0;
      if (w_IdecoActive) {
          const res = processIdecoStep(w_Ideco.principal, w_Ideco.assets, w_IdecoContrib, w_IdecoMonthlyRate);
          w_Ideco.principal = res.nextPrincipal; w_Ideco.assets = res.nextAssets;
          w_IdecoTotalYear += w_IdecoContrib;
      }

      const w_InsRes = processInsuranceStep(w_InsuranceProducts, w_Age, currentYear, m);
      w_InsuranceProducts = w_InsRes.nextProducts;
      w_YearlyPaid += (w_BonusAmt + w_ActualContrib + (w_IdecoActive ? w_IdecoContrib : 0) + w_InsRes.monthlyTotalPaid);

      // --- 2. INCOME & WITHDRAWAL (Living Costs) ---
      let h_Pension = (h_Age >= state.husband.pensionStartAge) ? state.husband.monthlyPension : 0;
      let w_Pension = (w_Age >= state.wife.pensionStartAge) ? state.wife.monthlyPension : 0;
      annualPension += (h_Pension + w_Pension);

      // Husband Withdrawal
      if (h_Age >= state.husband.withdrawalStartAge) {
         let need = state.husband.monthlyWithdrawal;
         if (h_Pension >= need) {
            if(h_isActive) h_Nisa.assets += (h_Pension - need);
            h_Pension = 0; need = 0;
         } else {
            need -= h_Pension; h_Pension = 0;
         }
         if (need > 0) {
             withdrawFromAssets(need, h_Age, h_InsuranceProducts, h_Ideco, h_Nisa);
         }
      }

      // Wife Withdrawal
      if (w_Age >= state.wife.withdrawalStartAge) {
         let need = state.wife.monthlyWithdrawal;
         if (w_Pension >= need) {
            if(w_isActive) w_Nisa.assets += (w_Pension - need);
            w_Pension = 0; need = 0;
         } else {
            need -= w_Pension; w_Pension = 0;
         }
         if (need > 0) {
             withdrawFromAssets(need, w_Age, w_InsuranceProducts, w_Ideco, w_Nisa);
         }
      }

    } // End Month Loop

    // --- End of Year Logic ---
    if (housing.hasLoan && loanBalance > 0 && currentYear <= deductionEnd.year) {
        const potentialDed = loanBalance * (housing.deductionRate / 100);
        annualHousingDeduction = Math.min(potentialDed, 210000); 
    }

    let h_Deduction = 0, w_Deduction = 0;
    if (h_Gross > w_Gross) h_Deduction = annualHousingDeduction; else w_Deduction = annualHousingDeduction;

    const h_TaxRes = calculateAnnualTax(h_Gross, h_Deduction, h_IdecoTotalYear);
    const w_TaxRes = calculateAnnualTax(w_Gross, w_Deduction, w_IdecoTotalYear);
    
    const household_TakeHome = h_TaxRes.takeHome + w_TaxRes.takeHome + annualPension;
    const household_Investment = h_YearlyPaid + w_YearlyPaid;
    const household_Housing = annualHousingPayment;
    
    // --- Calculate Annual Fixed Cost from List ---
    let annualFixedCost = 0;
    state.family.fixedCosts.forEach(item => {
      if (item.frequency === 'monthly') {
        annualFixedCost += item.amount * 12;
      } else {
        annualFixedCost += item.amount;
      }
    });
    
    const remainingDisposable = household_TakeHome - household_Investment - household_Housing - annualFixedCost;

    // --- 4. ANNUAL GIFTS (Correctly applying Withdrawal Logic) ---
    // Update local vars for check
    let h_InsAssets = h_InsuranceProducts.reduce((sum, p) => sum + p.currentCashValue, 0);
    let w_InsAssets = w_InsuranceProducts.reduce((sum, p) => sum + p.currentCashValue, 0);
    
    if (state.family.children.length > 0) {
      let totalGiftNeed = 0;
      if (h_Age >= state.family.giftStartAge && h_Age <= state.family.giftEndAge) {
         totalGiftNeed += state.family.children.length * state.family.giftAnnualAmountPerChild;
      }
      state.family.children.forEach(child => {
         const childAge = getAge(child.birthDate, currentYear);
         if (childAge === state.family.childMarriageAge) {
            totalGiftNeed += state.family.marriageGiftAmountPerChild;
         }
      });
      
      if (totalGiftNeed > 0) {
        let h_Total = h_Nisa.assets + h_InsAssets + h_Ideco.assets; 
        let w_Total = w_Nisa.assets + w_InsAssets + w_Ideco.assets; 
        let remainingNeed = totalGiftNeed;
        let takeFromH = 0; 
        let takeFromW = 0;
        
        // Decide split based on asset size
        if (h_Total > w_Total) {
           const diff = h_Total - w_Total;
           const amount = Math.min(diff, remainingNeed);
           takeFromH += amount; remainingNeed -= amount;
        } else if (w_Total > h_Total) {
           const diff = w_Total - h_Total;
           const amount = Math.min(diff, remainingNeed);
           takeFromW += amount; remainingNeed -= amount;
        }
        if (remainingNeed > 0) { 
            takeFromH += remainingNeed / 2; 
            takeFromW += remainingNeed / 2; 
        }

        // Apply withdrawals
        if (takeFromH > 0) {
            withdrawFromAssets(takeFromH, h_Age, h_InsuranceProducts, h_Ideco, h_Nisa);
        }
        if (takeFromW > 0) {
            withdrawFromAssets(takeFromW, w_Age, w_InsuranceProducts, w_Ideco, w_Nisa);
        }
        cumulativeGifts += totalGiftNeed; 
      }
    }
    
    pushResult(
        yearIdx, 
        currentYear, 
        h_YearlyPaid, 
        w_YearlyPaid,
        {
            hGross: h_Gross,
            wGross: w_Gross,
            taxSoc: h_TaxRes.tax + h_TaxRes.social + w_TaxRes.tax + w_TaxRes.social,
            takeHome: household_TakeHome,
            housingCost: annualHousingPayment,
            housingDed: annualHousingDeduction,
            fixedCost: annualFixedCost,
            remDisposable: remainingDisposable
        }
    );

    if (h_Age > 100 && w_Age > 100) break;
  }

  return results;
};

export const formatCurrency = (value: number) => {
  if (Math.abs(value) >= 100000000) {
     return (value / 100000000).toFixed(2) + '億円';
  }
  return (value / 10000).toFixed(0) + '万円';
};

export const formatCurrencyFull = (value: number) => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(value);
};
