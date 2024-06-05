export function request(ctx) {
    if (!ctx.identity) {
      runtime.earlyReturn([]);
    }
    return {
      operation: "Query",
      query: {
        expression: "topItem = :topItem ",
        expressionValues: {
          ":topItem": { S: ctx.arguments.topItem },
        },
      },
      scanIndexForward:true,
    };
  }
  
  export function response(ctx) {
    return ctx.result.items;
  }