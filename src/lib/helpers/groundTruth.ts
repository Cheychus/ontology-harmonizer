export function extractGroundTruth() {
  const truth = [];
  arcStore.ontologyCandidates.entries().forEach((o) => {
    const value = o[0];
    const onto = o[1].value;
    truth.push({
      query: [value],
      ground_truth_iri: [onto],
    });
  });
  return JSON.stringify(truth);
}
