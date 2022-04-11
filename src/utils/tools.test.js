
const tools = require("./tools");

jest.setTimeout(50000);

describe("Test the vaults path", () => {
  beforeAll(async () =>
    { 
      // await tools.putConfigFile();
    }
  );

  afterAll(done => {
    done();
  });

  test("It should get the configuration json file content from storage", async () => 
    tools.getConfigFile('vaults.json')
    .then((vaultsConfig) =>{
      expect(vaultsConfig).toHaveProperty('tiers');
      expect(vaultsConfig.tiers).toEqual(expect.arrayContaining([
        expect.objectContaining({ tier: 1, prizes: 1, percentage: 3300, amount: 2000,  })
      ]));
    })
  );
});