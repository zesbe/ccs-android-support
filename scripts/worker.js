export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Detect platform from User-Agent header
    const userAgent = request.headers.get('user-agent') || '';
    const isWindows = userAgent.includes('Windows') || userAgent.includes('Win32');
    const isPowerShell = userAgent.includes('PowerShell') || userAgent.includes('pwsh');

    // Smart routing with platform detection
    let filePath;
    if (url.pathname === '/install' || url.pathname === '/install.sh') {
      filePath = (isWindows && isPowerShell) ? 'installers/install.ps1' : 'installers/install.sh';
    } else if (url.pathname === '/install.ps1') {
      filePath = 'installers/install.ps1';
    } else if (url.pathname === '/uninstall' || url.pathname === '/uninstall.sh') {
      filePath = (isWindows && isPowerShell) ? 'installers/uninstall.ps1' : 'installers/uninstall.sh';
    } else if (url.pathname === '/uninstall.ps1') {
      filePath = 'installers/uninstall.ps1';
    } else {
      return new Response('Not Found', { status: 404 });
    }

    try {
      const githubUrl = `https://raw.githubusercontent.com/kaitranntt/ccs/main/${filePath}`;
      const response = await fetch(githubUrl);

      if (!response.ok) {
        return new Response('File not found on GitHub', { status: 404 });
      }

      const contentType = filePath.endsWith('.ps1')
        ? 'text/plain; charset=utf-8'
        : 'text/x-shellscript; charset=utf-8';

      return new Response(response.body, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=300'
        }
      });
    } catch (error) {
      return new Response('Server Error', { status: 500 });
    }
  }
};