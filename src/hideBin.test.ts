import hideBin, { getProcessArgvBinIndex, isBundledElectronApp, isElectronApp } from './hideBin'

// test known constants of the testing environment
describe('hideBin', () => {
  it('should not claim it\'s electron', () => {
    expect(isElectronApp()).toBe(false)
  })
  it('should not claim it\'s a bundled electron app', () => {
    expect(isBundledElectronApp()).toBe(false)
  })
  it('should return 1 for the index of the binary in process.argv', () => {
    expect(getProcessArgvBinIndex()).toBe(1)
  })
  it('should hide the binary name', () => {
    expect(hideBin(process.argv)).toEqual([])
  })
})