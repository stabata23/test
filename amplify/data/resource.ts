import { a, defineData, type ClientSchema } from '@aws-amplify/backend';

const schema = a.schema({
    MaintenanceTable: a.model({
      topItem: a.string().required(),
      bottomItem: a.string().required(),
      imo: a.string().required(),
      maintenancePosition: a.string(),
      maintenancePoint: a.string(),
      name: a.string(),
      lastPlanDate: a.string(),
      interval: a.integer(),
      intervalUnit: a.string(),
      dueDate: a.string(),
      nextPlanDate: a.string(),
      incompleteAlertFlg: a.string(),
      nextPlanDateAlertFlg: a.string(),
      updateUser: a.string(),

    }).identifier(['topItem', 'bottomItem'])
    .secondaryIndexes((index) => [index("dueDate")])
    .authorization(allow => [allow.authenticated()]),

    MaintenanceInspectionDate: a.model({
      imoMaintenancePoint: a.string().required(),
      inspectionDateMaintenanceItem: a.string().required(),
      inspectionDate: a.string().required(),
      imo: a.string().required(),
      maintenancePoint: a.string(),
      maintenanceItem: a.string(),
      status: a.string(),
      reportNo: a.string(),
      note: a.string(),
      fileName: a.string(),
      createUser: a.string(),
      updateUser: a.string(),
      version: a.integer().default(0),
    }).identifier(['imoMaintenancePoint',  "inspectionDateMaintenanceItem"])
    .secondaryIndexes((index) => [index("maintenanceItem").sortKeys(["status"]).name("orderItem"),])
    .authorization(allow => [allow.authenticated()]),

    VoyagePlan: a.model({
      imo: a.string().required(),
      goalDateTime: a.string().required(),
      startPoint: a.string().required(),
      startDate: a.string().required(),
      startHour: a.string().required(),
      startMinutes: a.string().required(),
      goalPoint: a.string().required(),
      goalDate: a.string().required(),
      goalHour: a.string().required(),
      goalMinutes: a.string().required(),
      sailingTime: a.string().required(),
    }).identifier(['imo',  "goalDateTime"])
    .authorization(allow => [allow.authenticated()]), 
    
    FileManagement: a.model({
      imo: a.string().required(),
      prefix: a.string().required(),
      fileName: a.string().required(),
      fileType: a.string().required(),
    }).identifier(['imo',  "prefix"])
    .authorization(allow => [allow.authenticated()]), 

    SpareParts: a.model({
      imo: a.string().required(),
      partsCode: a.string().required(),
      kind: a.string().required(),
      partsName: a.string().required(),
      unit: a.string().required(),
      stock: a.integer().required(),
      recommendedStock: a.integer().required(),
      note: a.string().required(),
    }).identifier(['imo',  "partsCode"])
    .authorization(allow => [allow.authenticated()]), 

    SparePartsKindMaster: a.model({
      imo: a.string().required(),
      seqNo: a.integer().required(),
      primaryCode: a.string().required(),
      secondaryCode: a.string(),
      tertiaryCode: a.string(),
      name: a.string(),
    }).identifier(['imo',  "seqNo"])
    .authorization(allow => [allow.authenticated()]), 

    MajorEquipmentReport: a.model({
      imo: a.string().required(),
      seqNo: a.integer().required(),
      createDate: a.string().required(),
      note: a.string(),
      completeFlg: a.string().required(),
      pendingWork: a.string(),
      fileName: a.string().required(),
      createUser: a.string(),
      updateUser: a.string(),
      version: a.integer().default(0),
    }).identifier(['imo',  "seqNo"])
    .authorization(allow => [allow.authenticated()]), 
        
    Sequence: a.model({
      imo: a.string().required(),
      seqPrefix: a.string().required(),
      currentValue: a.string().required(),
    }).identifier(['imo',  "seqPrefix"])
    .authorization(allow => [allow.authenticated()]), 
        
    CodeMaster: a.model({
      codeName: a.string().required(),
      value: a.string().required(),
      valueName: a.string().required(),
    }).identifier(['codeName',  "value"])
    .authorization(allow => [allow.authenticated()]), 
    
    DockConstructionReport: a.model({
      imo: a.string().required(),
      seqNo: a.integer().required(),
      kind: a.string().required(),
      createDate: a.string().required(),
      reportName: a.string(),
      fileName: a.string().required(),
      createUser: a.string(),
      updateUser: a.string(),
      version: a.integer().default(0),
    }).identifier(['imo',  "seqNo"])
    .authorization(allow => [allow.authenticated()]), 
    
    FailureReport: a.model({
      imo: a.string().required(),
      reportNo: a.string().required(),
      kind: a.string().required(),
      group: a.string().required(),
      accrualDate: a.string().required(),
      reportName: a.string(),
      personInCharge: a.string(),
      compleateStatus: a.string(),
      fileName: a.string().required(),
      createUser: a.string(),
      updateUser: a.string(),
      version: a.integer().default(0),
    }).identifier(['imo',  "reportNo"])
    .secondaryIndexes((index) => [index("imo").sortKeys(["accrualDate"]).name("orderAccrualDate"),
    index("imo").sortKeys(["group"]).name("orderGroup"),
    index("imo").sortKeys(["kind"]).name("orderKind"),])
    .authorization(allow => [allow.authenticated()]), 
    
    DeleteData: a.model({
      tableName: a.string().required(),
      id: a.id().required(),
      imo: a.string().required(),
      deleteData: a.string(),
    }).identifier(['tableName',  "id"])
    .authorization(allow => [allow.authenticated()]), 


    MaintenanceTables: a.customType({
      topItem: a.string().required(),
      bottomItem: a.string().required(),
      maintenancePosition: a.string().required(),
      name: a.string().required(),
      incompleteAlertFlg: a.string().required(),
      nextPlanDateAlertFlg: a.string().required(),
    }),
    queryGetInitialDisplay:a.query()
      .arguments({
        topItem:a.string().required()
      })
      .returns(a.ref("MaintenanceTables").array())
      .authorization(allow => [allow.authenticated()])
      .handler([
        a.handler.custom({
          dataSource: a.ref("MaintenanceTable"),
          entry: "./queryGetInitialDisplay.js",
        }),
      ]),

    CodeMasters: a.customType({
      codeName:a.string().required(),
      value:a.string().required(),
      valueName:a.string().required(),
    }),
    queryGet2CodeList:a.query()
      .arguments({
        codeName1:a.string().required(),
        codeName2:a.string().required(),
      })
      .returns(a.ref("CodeMasters").array())
      .authorization(allow => [allow.authenticated()])
      .handler([
        a.handler.custom({
          dataSource: a.ref("CodeMaster"),
          entry: "./queryGet2CodeList.js",
          
        }),
      ]),  
});




// Used for code completion / highlighting when making requests from frontend
export type Schema = ClientSchema<typeof schema>;

// defines the data resource to be deployed
export const data = defineData({
  schema,
});