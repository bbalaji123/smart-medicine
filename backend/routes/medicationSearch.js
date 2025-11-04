const express = require('express');
const axios = require('axios');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/medication-search
// @desc    Search medications from OpenFDA database
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Search using OpenFDA API
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(query)}"*+openfda.generic_name:"${encodeURIComponent(query)}"*&limit=${limit}`;

    const response = await axios.get(fdaUrl);
    
    if (!response.data || !response.data.results) {
      return res.json({
        success: true,
        medications: []
      });
    }

    // Process and format the results
    const medications = response.data.results.map(drug => {
      const brandName = drug.openfda?.brand_name?.[0] || 'Unknown';
      const genericName = drug.openfda?.generic_name?.[0] || '';
      const manufacturer = drug.openfda?.manufacturer_name?.[0] || '';
      const route = drug.openfda?.route?.[0] || 'Oral';
      
      // Extract dosage information
      let dosageInfo = '';
      if (drug.dosage_and_administration && drug.dosage_and_administration.length > 0) {
        dosageInfo = drug.dosage_and_administration[0]
          .substring(0, 200)
          .replace(/<[^>]*>/g, ''); // Remove HTML tags
      }

      // Extract warnings/precautions
      let warnings = [];
      if (drug.warnings && drug.warnings.length > 0) {
        warnings = drug.warnings[0]
          .substring(0, 500)
          .replace(/<[^>]*>/g, '')
          .split('.')
          .filter(w => w.trim().length > 0)
          .slice(0, 3);
      }

      // Extract side effects
      let sideEffects = [];
      if (drug.adverse_reactions && drug.adverse_reactions.length > 0) {
        const reactionsText = drug.adverse_reactions[0].replace(/<[^>]*>/g, '');
        // Extract common side effects (simplified)
        const commonEffects = ['nausea', 'headache', 'dizziness', 'drowsiness', 'fatigue', 
                              'diarrhea', 'constipation', 'dry mouth', 'insomnia', 'rash'];
        sideEffects = commonEffects.filter(effect => 
          reactionsText.toLowerCase().includes(effect)
        );
      }

      return {
        brandName,
        genericName,
        manufacturer,
        route,
        dosageInfo,
        warnings,
        sideEffects,
        productType: drug.openfda?.product_type?.[0] || 'HUMAN PRESCRIPTION DRUG',
        substanceNames: drug.openfda?.substance_name || []
      };
    });

    res.json({
      success: true,
      count: medications.length,
      medications
    });

  } catch (error) {
    console.error('Medication search error:', error.message);
    
    // Fallback to mock data if API fails
    const mockMedications = getMockMedications(req.query.query);
    
    res.json({
      success: true,
      count: mockMedications.length,
      medications: mockMedications,
      note: 'Using offline medication database'
    });
  }
});

// @route   GET /api/medication-search/details/:name
// @desc    Get detailed information about a specific medication
// @access  Private
router.get('/details/:name', auth, async (req, res) => {
  try {
    const { name } = req.params;

    const fdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(name)}"+openfda.generic_name:"${encodeURIComponent(name)}"&limit=1`;

    const response = await axios.get(fdaUrl);
    
    if (!response.data || !response.data.results || response.data.results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Medication not found'
      });
    }

    const drug = response.data.results[0];
    
    const details = {
      brandName: drug.openfda?.brand_name?.[0] || name,
      genericName: drug.openfda?.generic_name?.[0] || '',
      manufacturer: drug.openfda?.manufacturer_name?.[0] || '',
      route: drug.openfda?.route?.[0] || 'Oral',
      indications: drug.indications_and_usage?.[0]?.replace(/<[^>]*>/g, '') || '',
      dosageAndAdministration: drug.dosage_and_administration?.[0]?.replace(/<[^>]*>/g, '') || '',
      contraindications: drug.contraindications?.[0]?.replace(/<[^>]*>/g, '') || '',
      warnings: drug.warnings?.[0]?.replace(/<[^>]*>/g, '') || '',
      adverseReactions: drug.adverse_reactions?.[0]?.replace(/<[^>]*>/g, '') || '',
      drugInteractions: drug.drug_interactions?.[0]?.replace(/<[^>]*>/g, '') || '',
      description: drug.description?.[0]?.replace(/<[^>]*>/g, '') || '',
      activeIngredients: drug.openfda?.substance_name || [],
      productType: drug.openfda?.product_type?.[0] || 'HUMAN PRESCRIPTION DRUG'
    };

    res.json({
      success: true,
      medication: details
    });

  } catch (error) {
    console.error('Medication details error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching medication details'
    });
  }
});

// Mock medication database for offline fallback
function getMockMedications(query) {
  const mockDatabase = [
    {
      brandName: 'Aspirin',
      genericName: 'Acetylsalicylic Acid',
      manufacturer: 'Various',
      route: 'Oral',
      dosageInfo: 'Typically 81-325mg once daily for cardiovascular protection',
      warnings: ['Risk of bleeding', 'Not for children with viral infections', 'Consult doctor if pregnant'],
      sideEffects: ['nausea', 'heartburn', 'dizziness'],
      productType: 'HUMAN OTC DRUG',
      substanceNames: ['Acetylsalicylic Acid']
    },
    {
      brandName: 'Ibuprofen',
      genericName: 'Ibuprofen',
      manufacturer: 'Various',
      route: 'Oral',
      dosageInfo: '200-800mg every 6-8 hours as needed for pain',
      warnings: ['May increase risk of heart attack or stroke', 'Can cause stomach bleeding'],
      sideEffects: ['nausea', 'heartburn', 'dizziness', 'headache'],
      productType: 'HUMAN OTC DRUG',
      substanceNames: ['Ibuprofen']
    },
    {
      brandName: 'Metformin',
      genericName: 'Metformin Hydrochloride',
      manufacturer: 'Various',
      route: 'Oral',
      dosageInfo: '500-2000mg daily with meals for type 2 diabetes',
      warnings: ['Risk of lactic acidosis', 'Kidney function monitoring required'],
      sideEffects: ['nausea', 'diarrhea', 'fatigue'],
      productType: 'HUMAN PRESCRIPTION DRUG',
      substanceNames: ['Metformin Hydrochloride']
    },
    {
      brandName: 'Lisinopril',
      genericName: 'Lisinopril',
      manufacturer: 'Various',
      route: 'Oral',
      dosageInfo: '10-40mg once daily for high blood pressure',
      warnings: ['Not for use during pregnancy', 'Monitor potassium levels'],
      sideEffects: ['dizziness', 'headache', 'dry mouth', 'fatigue'],
      productType: 'HUMAN PRESCRIPTION DRUG',
      substanceNames: ['Lisinopril']
    },
    {
      brandName: 'Omeprazole',
      genericName: 'Omeprazole',
      manufacturer: 'Various',
      route: 'Oral',
      dosageInfo: '20-40mg once daily before eating',
      warnings: ['Long-term use may increase fracture risk', 'May mask symptoms of serious conditions'],
      sideEffects: ['headache', 'nausea', 'diarrhea', 'constipation'],
      productType: 'HUMAN OTC DRUG',
      substanceNames: ['Omeprazole']
    },
    {
      brandName: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      manufacturer: 'Pfizer',
      route: 'Oral',
      dosageInfo: '10-80mg once daily for cholesterol management',
      warnings: ['Muscle pain or weakness should be reported', 'Liver function tests recommended'],
      sideEffects: ['diarrhea', 'nausea', 'headache', 'fatigue'],
      productType: 'HUMAN PRESCRIPTION DRUG',
      substanceNames: ['Atorvastatin Calcium']
    },
    {
      brandName: 'Levothyroxine',
      genericName: 'Levothyroxine Sodium',
      manufacturer: 'Various',
      route: 'Oral',
      dosageInfo: '25-200mcg once daily on empty stomach',
      warnings: ['Do not stop without consulting doctor', 'Interactions with many medications'],
      sideEffects: ['headache', 'insomnia', 'nervousness'],
      productType: 'HUMAN PRESCRIPTION DRUG',
      substanceNames: ['Levothyroxine Sodium']
    },
    {
      brandName: 'Amlodipine',
      genericName: 'Amlodipine Besylate',
      manufacturer: 'Pfizer',
      route: 'Oral',
      dosageInfo: '2.5-10mg once daily for blood pressure',
      warnings: ['May cause swelling of ankles/feet', 'Dizziness when standing up'],
      sideEffects: ['dizziness', 'fatigue', 'headache'],
      productType: 'HUMAN PRESCRIPTION DRUG',
      substanceNames: ['Amlodipine Besylate']
    }
  ];

  if (!query || query.trim().length === 0) {
    return mockDatabase;
  }

  const searchTerm = query.toLowerCase();
  return mockDatabase.filter(med => 
    med.brandName.toLowerCase().includes(searchTerm) ||
    med.genericName.toLowerCase().includes(searchTerm)
  );
}

module.exports = router;
