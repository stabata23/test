export function request(ctx) {
    if (!ctx.identity) {
      runtime.earlyReturn([]);
    }
    return {
      operation: "Query",
      query: {
        expression: "codeName1 = :codeName1 ",
        expressionValues: {
          ":codeName1": { S: ctx.arguments.codeName1 },
          ":codeName2": { S: ctx.arguments.codeName2 },
        },
      },
      scanIndexForward:true,
    };
  }
  
  export function response(ctx) {
    return ctx.result.items;
  }