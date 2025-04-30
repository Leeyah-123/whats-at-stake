'use client';

import { useProfile } from '@/components/profile/profile-provider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useWallet } from '@/components/wallet/wallet-provider';
import type { Validator } from '@/lib/types';
import { formatNumber, formatPercentage } from '@/lib/utils';
import {
  ArrowUpDown,
  CheckCircle,
  ChevronDown,
  Filter,
  Search,
  Star,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useStaking } from '../providers/staking-provider';
import { ErrorAlert } from './error-alert';
import { ValidatorDetailsCard } from './validator-details-card';

type SortKey =
  | 'name'
  | 'stake'
  | 'commission'
  | 'apy'
  | 'skippedSlots'
  | 'score';
type SortDirection = 'asc' | 'desc';

export function Validators() {
  const { data, error, refreshData } = useStaking();
  const { connected } = useWallet();
  const { addFavoriteValidator, removeFavoriteValidator, isValidatorFavorite } =
    useProfile();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('stake');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [showDelinquentOnly, setShowDelinquentOnly] = useState(false);

  const handleFavoriteClick = (validator: Validator, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!connected) return;

    if (isValidatorFavorite(validator.identity)) {
      removeFavoriteValidator(validator.identity);
    } else {
      addFavoriteValidator({
        identity: validator.identity,
        name: validator.name,
      });
    }
  };

  // Filter validators based on search query and other filters
  const filteredValidators = data.validators.filter((validator) => {
    // Apply search filter
    const matchesSearch =
      validator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      validator.identity.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply delinquent filter if enabled
    const matchesDelinquent = showDelinquentOnly ? validator.delinquent : true;

    return matchesSearch && matchesDelinquent;
  });

  // Sort validators
  const sortedValidators = [...filteredValidators].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortKey) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'stake':
        aValue = a.activatedStake;
        bValue = b.activatedStake;
        break;
      case 'commission':
        aValue = a.commission;
        bValue = b.commission;
        break;
      case 'apy':
        aValue = a.apy;
        bValue = b.apy;
        break;
      case 'skippedSlots':
        aValue = a.skippedSlots;
        bValue = b.skippedSlots;
        break;
      case 'score':
        aValue = a.score;
        bValue = b.score;
        break;
      default:
        aValue = a.activatedStake;
        bValue = b.activatedStake;
    }

    const direction = sortDirection === 'asc' ? 1 : -1;

    if (typeof aValue === 'string') {
      return aValue.localeCompare(bValue) * direction;
    }

    return (aValue - bValue) * direction;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const handleRowClick = (validator: Validator) => {
    setSelectedValidator(validator);
  };

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Validator Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <ErrorAlert message={error} onRetry={() => refreshData()} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-3 w-full overflow-x-auto">
          <CardHeader className="pb-3">
            <CardTitle>Validator Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search validators..."
                  className="w-full pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto justify-between md:justify-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={showDelinquentOnly}
                      onCheckedChange={setShowDelinquentOnly}
                    >
                      Show Delinquent Only
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Badge variant="outline" className="text-xs">
                  {filteredValidators.length} validators
                </Badge>
              </div>
            </div>

            <div className="relative overflow-x-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12 text-center">Status</TableHead>
                    <TableHead className="min-w-[200px]">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        Validator
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('stake')}
                      >
                        Stake
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('commission')}
                      >
                        Commission
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px]">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('apy')}
                      >
                        APY
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('score')}
                      >
                        Score
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedValidators.map((validator) => (
                    <TableRow
                      key={validator.identity}
                      className={validator.delinquent ? 'bg-red-500/10' : ''}
                      onClick={() => handleRowClick(validator)}
                    >
                      <TableCell>
                        <div className="flex justify-center">
                          {validator.delinquent ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                          ) : (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {connected && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => handleFavoriteClick(validator, e)}
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  isValidatorFavorite(validator.identity)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted-foreground'
                                }`}
                              />
                            </Button>
                          )}
                          <div className="font-medium">{validator.name}</div>
                          {validator.delinquent && (
                            <Badge variant="destructive">Delinquent</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>
                            {formatNumber(validator.activatedStake)} SOL
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatPercentage(validator.stakePercentage)}% of
                            network
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{validator.commission}%</TableCell>
                      <TableCell className="text-green-500">
                        {validator.apy}%
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span
                            className={
                              validator.score >= 80
                                ? 'text-green-500'
                                : validator.score >= 60
                                ? 'text-amber-500'
                                : 'text-red-500'
                            }
                          >
                            {Math.round(validator.score)}
                          </span>
                          <Progress
                            value={validator.score}
                            className="h-2 w-16"
                            indicatorClassName={
                              validator.score >= 80
                                ? 'bg-green-500'
                                : validator.score >= 60
                                ? 'bg-amber-500'
                                : 'bg-red-500'
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {selectedValidator && (
          <Card className="lg:col-span-3">
            <ValidatorDetailsCard validator={selectedValidator} />
          </Card>
        )}
      </div>
    </>
  );
}
