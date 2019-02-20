const transfer_payment_location_query  = `
query {
  root(lang: "en") {
    transfer_payment_location(code: "1209034") {
        location_def {
        lat
        lng
        level
        location_code
        name
        } 
      transfer_payment_location_records {
        id
        situation
        level
        fyear
        deptcode
        transferpayment
        pa_recipient
        amount
        city
        province
        country
        location_code
      }
    }
    
    location_def(code: "1209034") {
      lat
      lng
      level
      location_code
      name
      transfer_payment_location_records {
        id
        situation
        level
        fyear
        deptcode
        transferpayment
        pa_recipient
        amount
        city
        province
        country
        location_code
      }
    }
  }
}
`;


const { execQuery } = global;

describe("transfer payment location", function(){

  it("gives location def and transfer payment location records", async ()=> {
    const data = await execQuery(transfer_payment_location_query, {});
    return expect(data).toMatchSnapshot();
  });

})
