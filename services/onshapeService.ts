import type { OnshapeConfig } from "../types";
import { ON_SHAPE_IDENTIFIER, ON_SHAPE_PROPERTY_ID_MAP } from '../constants';
import { onshapeFetch } from '../utils/onshapeAPI';

// This service now makes real, authenticated Onshape API calls.

interface UpdateResult {
  success: boolean;
  error?: string;
}

type OnshapePart = Record<string, string>;

// Base URL for Onshape API calls. Using a proxy to handle CORS.
const ON_SHAPE_API_BASE_URL = 'https://cad.onshape.com';

const getAllParts = async (config: OnshapeConfig): Promise<OnshapePart[]> => {
    // This is a complex operation. To avoid excessive API calls and long wait times,
    // we'll fetch a limited number of documents and process their contents.
    console.log('--- REAL API CALL: GET ALL PARTS ---');
    
    // 1. Fetch documents owned by the user
    const documents = await onshapeFetch(
        `${ON_SHAPE_API_BASE_URL}/api/documents?limit=50&filter=1`,
        'GET',
        config
    );

    const allParts: OnshapePart[] = [];
    
    // Process each document in parallel to speed things up
    await Promise.all(documents.items.map(async (doc: any) => {
        try {
            // 2. Get elements in the default workspace
            const elements = await onshapeFetch(
                `${ON_SHAPE_API_BASE_URL}/api/documents/d/${doc.id}/w/${doc.defaultWorkspace.id}/elements`,
                'GET',
                config
            );

            // 3. Filter for Part Studios
            const partStudios = elements.filter((el: any) => el.elementType === 'PARTSTUDIO');

            for (const ps of partStudios) {
                // 4. Get metadata for all parts in the Part Studio
                const partStudioMetadata = await onshapeFetch(
                    `${ON_SHAPE_API_BASE_URL}/api/partstudios/d/${doc.id}/w/${doc.defaultWorkspace.id}/e/${ps.id}/metadata`,
                    'GET',
                    config
                );

                for (const part of partStudioMetadata.parts) {
                    const properties: Record<string, string> = {};
                    if (part.properties) {
                       part.properties.forEach((prop: any) => {
                           properties[prop.name] = prop.value;
                       });
                    }

                    const partUrl = `https://cad.onshape.com/documents/${doc.id}/w/${doc.defaultWorkspace.id}/e/${ps.id}?partId=${part.partId}`;

                    const onshapePart: OnshapePart = {
                        [ON_SHAPE_IDENTIFIER]: partUrl,
                        'Name': properties['Name'] || part.name || '',
                        'Description': properties['Description'] || '',
                        'Part Number': properties['Part Number'] || '',
                        'Revision': properties['Revision'] || '',
                        'State': properties['State'] || '',
                        'Material': 'N/A', 
                        'Vendor': properties['Vendor'] || '',
                        'Cost': properties['Cost'] || '',
                        'Weight': 'N/A',
                        'Title 1': properties['Title 1'] || '',
                        'Title 2': properties['Title 2'] || '',
                        'Title 3': properties['Title 3'] || '',
                    };
                    allParts.push(onshapePart);
                }
            }
        } catch (error) {
            console.warn(`Could not process document ${doc.name}:`, error);
        }
    }));
    
    console.log(`Found ${allParts.length} parts across ${documents.items.length} documents.`);
    return allParts;
};

const updatePartProperties = async (
  partUrl: string,
  properties: Record<string, any>,
  config: OnshapeConfig
): Promise<UpdateResult> => {
  if (!partUrl) {
    return Promise.resolve({ success: false, error: 'Onshape Part URL is missing.' });
  }

  const urlRegex = /documents\/(?<did>\w+)\/(?<wvid_type>w|v|m)\/(?<wvid>\w+)\/e\/(?<eid>\w+)/;
  const match = partUrl.match(urlRegex);
  
  if (!match?.groups) {
    return Promise.resolve({ success: false, error: 'Invalid Onshape URL format.' });
  }

  const { did, wvid_type, wvid, eid } = match.groups;
  
  let partid: string | null = null;
  try {
    const url = new URL(partUrl);
    partid = url.searchParams.get('partId');
  } catch (e) {
    const partidMatch = partUrl.match(/[?&]partId=([^&]+)/);
    partid = partidMatch ? partidMatch[1] : null;
  }

  if (!partid) {
    return Promise.resolve({ success: false, error: 'Part ID not found in URL.' });
  }

  const propertiesPayload = Object.entries(properties)
    .map(([name, value]) => {
        const propertyId = ON_SHAPE_PROPERTY_ID_MAP[name];
        if (propertyId) {
            return { propertyId, value };
        }
        console.warn(`Skipping property "${name}" as it is not a standard, updatable property.`);
        return null;
    })
    .filter((p): p is { propertyId: string; value: any; } => p !== null);

  if (propertiesPayload.length === 0) {
    console.log(`No updatable properties for part ${partid}. Skipping.`);
    return { success: true };
  }

  const payload = { properties: propertiesPayload };

  // Note: Onshape metadata updates don't work on microversions ('m').
  const wv = wvid_type === 'v' ? 'v' : 'w';
  const apiUrl = `${ON_SHAPE_API_BASE_URL}/api/metadata/d/${did}/${wv}/${wvid}/e/${eid}/partid/${partid}`;

  console.log('--- REAL API CALL: UPDATE PROPERTIES ---');
  console.log(`Calling Onshape API Endpoint: ${apiUrl}`);
  console.log('Payload:', payload);
  console.log('----------------------------------------');

  try {
    await onshapeFetch(apiUrl, 'POST', config, payload);
    return { success: true };
  } catch (error: any) {
    console.error(`Failed to update properties for part ${partid}:`, error);
    const message = await error.text ? await error.text() : (error.message || 'API error.');
    return { success: false, error: message };
  }
};

export const onshapeService = {
  updatePartProperties,
  getAllParts,
};
