'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: 'Silk Road ERP',
    companyEmail: 'info@silkroad.com',
    companyPhone: '+1-555-0000',
    defaultCurrency: 'USD',
    dateFormat: 'MM/DD/YYYY',
    invoicePrefix: 'INV',
    invoiceStartNumber: '1000',
    taxRate: '8.5',
    enableTwoFactor: true,
    autoBackup: true,
    backupFrequency: 'daily',
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    setHasChanges(false);
  };

  const handleReset = () => {
    setHasChanges(false);
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure global application parameters and preferences.
        </p>
      </div>

      {/* Company Information */}
      <Card className="border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Company Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-foreground">
              Company Name
            </Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyEmail" className="text-foreground">
              Company Email
            </Label>
            <Input
              id="companyEmail"
              type="email"
              value={settings.companyEmail}
              onChange={(e) => handleChange('companyEmail', e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyPhone" className="text-foreground">
              Company Phone
            </Label>
            <Input
              id="companyPhone"
              value={settings.companyPhone}
              onChange={(e) => handleChange('companyPhone', e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="defaultCurrency" className="text-foreground">
              Default Currency
            </Label>
            <Input
              id="defaultCurrency"
              value={settings.defaultCurrency}
              onChange={(e) => handleChange('defaultCurrency', e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>
      </Card>

      {/* Document Settings */}
      <Card className="border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Document Settings
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="dateFormat" className="text-foreground">
              Date Format
            </Label>
            <Input
              id="dateFormat"
              value={settings.dateFormat}
              onChange={(e) => handleChange('dateFormat', e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoicePrefix" className="text-foreground">
              Invoice Prefix
            </Label>
            <Input
              id="invoicePrefix"
              value={settings.invoicePrefix}
              onChange={(e) => handleChange('invoicePrefix', e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceStartNumber" className="text-foreground">
              Invoice Start Number
            </Label>
            <Input
              id="invoiceStartNumber"
              value={settings.invoiceStartNumber}
              onChange={(e) => handleChange('invoiceStartNumber', e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate" className="text-foreground">
              Default Tax Rate (%)
            </Label>
            <Input
              id="taxRate"
              type="number"
              step="0.1"
              value={settings.taxRate}
              onChange={(e) => handleChange('taxRate', e.target.value)}
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Security Settings
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enableTwoFactor}
              onChange={(e) => handleChange('enableTwoFactor', e.target.checked)}
              className="rounded"
            />
            <span className="text-foreground">
              Enable Two-Factor Authentication
            </span>
          </label>
        </div>
      </Card>

      {/* Backup Settings */}
      <Card className="border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">
          Backup Settings
        </h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => handleChange('autoBackup', e.target.checked)}
              className="rounded"
            />
            <span className="text-foreground">Enable Automatic Backups</span>
          </label>
          {settings.autoBackup && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="backupFrequency" className="text-foreground">
                Backup Frequency
              </Label>
              <select
                id="backupFrequency"
                value={settings.backupFrequency}
                onChange={(e) => handleChange('backupFrequency', e.target.value)}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={!hasChanges}
          className="gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={!hasChanges}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
