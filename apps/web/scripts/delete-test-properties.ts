import { dbConnect } from '../lib/db';
import { Property } from '../models/Property';

async function deleteTestProperties() {
  try {
    await dbConnect();
    
    const propertyNames = ["Brazil Penthouse", "9uijio"];
    
    console.log(`🔍 Looking for properties: ${propertyNames.join(", ")}`);
    
    // First, find the properties to verify they exist
    const properties = await Property.find({ 
      name: { $in: propertyNames } 
    });
    
    if (properties.length === 0) {
      console.log("ℹ️  No properties found with those names.");
      process.exit(0);
    }
    
    console.log(`\n📋 Found ${properties.length} properties to delete:`);
    properties.forEach(p => {
      console.log(`  - ${p.name} (ID: ${p._id})`);
    });
    
    // Delete only these specific properties by name
    const result = await Property.deleteMany({ 
      name: { $in: propertyNames } 
    });
    
    console.log(`\n✅ Successfully deleted ${result.deletedCount} properties.`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error deleting properties:", error);
    process.exit(1);
  }
}

deleteTestProperties();
