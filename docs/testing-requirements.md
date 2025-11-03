# CCS Testing Requirements & Procedures

**Version:** 2.1.4
**Last Updated:** 2025-11-03
**Status:** Active

## Overview

This document outlines the comprehensive testing requirements and procedures for the CCS (Claude Code Switch) project. Following these guidelines ensures consistent, reliable, and cross-platform compatible releases.

## Test Suite Structure

### Core Test Files

| Test File | Purpose | Coverage | Platforms |
|-----------|---------|----------|-----------|
| `tests/uninstall-test.sh` | Uninstall functionality validation | 20 tests | Unix/Linux/macOS |
| `tests/uninstall-test.ps1` | Uninstall functionality validation | 20 tests | Windows |
| `tests/edge-cases.sh` | Comprehensive edge case testing | 37 tests | Unix/Linux/macOS |
| `tests/edge-cases.ps1` | Comprehensive edge case testing | 37 tests | Windows |

### Test Categories

#### 1. Uninstall Functionality Tests (20 tests)
**File:** `tests/uninstall-test.sh` / `tests/uninstall-test.ps1`

**Sections:**
1. **Empty Uninstall (3 tests)**
   - Command executes without error
   - Appropriate "nothing to uninstall" messaging
   - Reports 0 items removed correctly

2. **Install/Uninstall Cycle (5 tests)**
   - Clean uninstall execution
   - Removes ccs.md command file
   - Removes ccs-delegation skill directory
   - Preserves other commands (non-invasive)
   - Preserves other skills (non-invasive)

3. **Idempotency (2 tests)**
   - Second uninstall succeeds
   - Reports nothing found on subsequent runs

4. **Output Formatting (4 tests)**
   - Contains box-drawing headers
   - Shows success messages
   - Provides reinstallation instructions

5. **Integration Tests (3 tests)**
   - No profile errors on uninstall
   - Version command still works
   - Help command still works

6. **Edge Cases (3 tests)**
   - Partial installations handled
   - Missing directories handled
   - Error scenarios managed gracefully

#### 2. Comprehensive Edge Cases (37 tests)
**File:** `tests/edge-cases.sh` / `tests/edge-cases.ps1`

**Coverage Areas:**
- **Version Commands (3 tests)**
- **Help Commands (2 tests)**
- **Argument Parsing (6 tests)**
- **Profile Commands (4 tests)**
- **Error Handling (3 tests)**
- **Edge Cases (6 tests)**
- **Configuration Validation (6 tests)**
- **Real Usage Simulation (3 tests)**
- **Platform-Specific Tests (4 tests)**

## Testing Environment Requirements

### Environment Variable Isolation

**Critical Requirement:** All tests must use isolated HOME directories to prevent impact on user data.

**Implementation Pattern:**
```bash
# Unix/Linux/macOS
HOME=/tmp/test-ccs-home ./ccs --install
HOME=/tmp/test-ccs-home ./ccs --uninstall

# Windows PowerShell
$env:HOME = "C:\temp\test-ccs-home"
.\ccs.ps1 --install
.\ccs.ps1 --uninstall
```

**Validation Requirements:**
- ✅ Install uses test directory (not `~/.claude`)
- ✅ Uninstall removes files from test directory only
- ✅ Real user directories completely unaffected
- ✅ Perfect test isolation achieved

### Cross-Platform Compatibility

**Platform-Specific Patterns:**
- **Bash Version:** Uses `$HOME/.claude` directly
- **PowerShell Version:** Uses HOME-first pattern with USERPROFILE fallback

**PowerShell Pattern:**
```powershell
$HomeDir = if ($env:HOME) { $env:HOME } else { $env:USERPROFILE }
```

## Test Execution Procedures

### Prerequisites

1. **Clean Test Environment**
   ```bash
   # Remove any existing CCS installation
   rm -rf ~/.ccs ~/.local/bin/ccs
   ```

2. **Required Tools**
   - bash 3.2+ (Unix/Linux/macOS)
   - PowerShell 5.1+ (Windows)
   - Claude CLI 2.0.31+
   - jq 1.6+ (optional, for JSON validation)

### Running Tests

#### Unix/Linux/macOS
```bash
# Navigate to CCS directory
cd /path/to/ccs

# Run uninstall tests
./tests/uninstall-test.sh

# Run edge case tests
./tests/edge-cases.sh

# Run all tests (full suite)
./tests/uninstall-test.sh && ./tests/edge-cases.sh
```

#### Windows
```powershell
# Navigate to CCS directory
cd C:\path\to\ccs

# Run uninstall tests
.\tests\uninstall-test.ps1

# Run edge case tests
.\tests\edge-cases.ps1

# Run all tests (full suite)
.\tests\uninstall-test.ps1; .\tests\edge-cases.ps1
```

### Expected Results

**Success Criteria:**
- **Total Test Pass Rate:** 100%
- **Individual Test Suites:** Each must pass 100%
- **Environment Isolation:** No impact on user data
- **Cross-Platform Consistency:** Identical behavior across platforms

**Sample Output:**
```
=== CCS Uninstall Test Results ===
Total Tests: 20
Passed: 20 (100%)
Failed: 0 (0%)
Status: ✅ ALL TESTS PASSED
```

## Quality Assurance Standards

### Code Quality Requirements

1. **Syntax Validation**
   ```bash
   # Bash syntax check
   bash -n ccs
   bash -n install.sh
   bash -n uninstall.sh

   # PowerShell syntax check
   Get-Command Test-Path -Syntax ccs.ps1
   ```

2. **Pattern Consistency**
   - HOME-first environment variable pattern
   - Consistent error handling
   - Uniform output formatting

3. **Security Validation**
   - No impact on user data
   - Proper file permissions
   - No unauthorized directory access

### Functional Testing Requirements

1. **Happy Path Testing**
   - Standard operations work perfectly
   - Default behaviors function as expected
   - User workflows complete successfully

2. **Edge Case Handling**
   - Robust handling of unexpected inputs
   - Graceful failure modes
   - Clear error messages with actionable solutions

3. **Integration Testing**
   - CLI integration with all commands
   - Path operations work correctly
   - Environment variable handling is reliable

## Test Coverage Metrics

### Current Coverage (v2.1.4)

| Test Category | Tests | Pass Rate | Status |
|---------------|-------|-----------|--------|
| Uninstall Functionality | 20 | 100% | ✅ Complete |
| Edge Cases | 37 | 100% | ✅ Complete |
| Cross-Platform Validation | 57 | 100% | ✅ Complete |
| Environment Isolation | 57 | 100% | ✅ Complete |
| **Total Coverage** | **57** | **100%** | **✅ Complete** |

### Coverage Goals for Future Releases

| Metric | Target | Current Status |
|--------|--------|----------------|
| Test Pass Rate | >95% | 100% ✅ |
| Cross-Platform Coverage | 100% | 100% ✅ |
| Edge Case Coverage | >90% | 100% ✅ |
| Environment Isolation | 100% | 100% ✅ |
| Security Validation | 100% | 100% ✅ |

## Automated Testing Integration

### CI/CD Pipeline Requirements

**Recommended Integration:**
```yaml
# GitHub Actions example
- name: Run CCS Tests
  run: |
    ./tests/uninstall-test.sh
    ./tests/edge-cases.sh
```

**Test Automation Benefits:**
- Consistent test execution
- Early detection of regressions
- Cross-platform validation
- Automated quality gates

### Performance Testing

**Test Execution Benchmarks:**
- **Uninstall Tests:** ~15 seconds
- **Edge Case Tests:** ~45 seconds
- **Total Suite:** ~60 seconds
- **Memory Usage:** Minimal
- **Disk I/O:** Controlled and temporary

## Test Maintenance Procedures

### When to Update Tests

1. **New Features Added**
   - Add corresponding test cases
   - Update test documentation
   - Validate cross-platform compatibility

2. **Bug Fixes Implemented**
   - Add regression tests for fixed bugs
   - Verify fix doesn't break existing functionality
   - Update test coverage metrics

3. **Platform Changes**
   - Test on new platform versions
   - Update platform-specific test cases
   - Validate compatibility

### Test Review Process

1. **Code Review Integration**
   - Tests reviewed alongside code changes
   - Ensure test coverage for new functionality
   - Validate test quality and effectiveness

2. **Release Validation**
   - Full test suite execution before releases
   - Cross-platform validation
   - Performance benchmarking

## Troubleshooting Test Failures

### Common Issues

1. **Environment Variable Conflicts**
   - **Symptom:** Tests affecting user directories
   - **Solution:** Verify HOME isolation pattern
   - **Prevention:** Always use isolated test environments

2. **Permission Issues**
   - **Symptom:** File operation failures
   - **Solution:** Check file permissions and paths
   - **Prevention:** Validate prerequisites before testing

3. **Platform-Specific Failures**
   - **Symptom:** Tests pass on one platform, fail on another
   - **Solution:** Review platform-specific code paths
   - **Prevention:** Test on all supported platforms

### Debug Procedures

1. **Enable Verbose Output**
   ```bash
   # Add debug flags to test scripts
   ./tests/uninstall-test.sh --verbose
   ```

2. **Isolate Failing Tests**
   ```bash
   # Run individual test sections
   ./tests/uninstall-test.sh --section=empty-uninstall
   ```

3. **Validate Environment**
   ```bash
   # Check environment variables
   echo "HOME: $HOME"
   echo "USERPROFILE: $USERPROFILE"
   ```

## Best Practices

### Test Development Guidelines

1. **Test Isolation**
   - Never modify user data during tests
   - Use temporary directories for all file operations
   - Clean up all test artifacts

2. **Cross-Platform Considerations**
   - Test on all supported platforms
   - Use platform-agnostic patterns where possible
   - Handle platform-specific differences explicitly

3. **Maintainability**
   - Clear test documentation
   - Consistent test structure
   - Reusable test utilities

### Continuous Improvement

1. **Test Coverage Analysis**
   - Regular coverage assessment
   - Identify untested code paths
   - Prioritize high-risk areas

2. **Performance Monitoring**
   - Track test execution times
   - Identify performance regressions
   - Optimize slow test cases

3. **Quality Metrics**
   - Monitor test pass rates
   - Track bug detection rates
   - Measure test effectiveness

## References

### Related Documentation
- **Project Roadmap:** `/docs/project-roadmap.md`
- **Implementation Plans:** `/plans/`
- **Code Standards:** `/docs/code-standards.md`
- **System Architecture:** `/docs/system-architecture.md`

### Test Reports
- **Uninstall Test Report:** `/plans/reports/241103-from-qa-engineer-to-development-team-ccs-uninstall-testing-report.md`
- **Code Review Reports:** `/plans/reports/251103-code-review-phase1-phase2.md`

### External Resources
- **Claude CLI Documentation:** https://docs.anthropic.com/claude/reference/claude-cli
- **PowerShell Best Practices:** https://docs.microsoft.com/en-us/powershell/scripting/dev-cross-plat/writing-portable-cmdlets

---

**Maintained By:** QA Engineer & Development Team
**Review Frequency:** Monthly or after major releases
**Last Updated:** 2025-11-03

**Unresolved Questions:** None
**Blockers:** None
**Next Review:** Post v2.1.4 release