'use client';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Validator } from '@/lib/types';
import { formatNumber, formatPercentage } from '@/lib/utils';
import {
  ArrowDownIcon,
  ArrowUpDown,
  ArrowUpIcon,
  ChevronDown,
  Filter,
  Search,
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
  const { data, loading, error, refreshData } = useStaking();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('stake');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedValidator, setSelectedValidator] = useState<Validator | null>(
    null
  );
  const [showDelinquentOnly, setShowDelinquentOnly] = useState(false);

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
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle>Validator Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search validators by name or identity..."
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

            <ScrollArea className="h-[600px] md:h-[500px] w-full rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-12 text-center">Status</TableHead>
                    <TableHead className="w-[200px]">
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('name')}
                      >
                        Validator
                        <ArrowUpDown className="ml-2 h-3 w-3" />
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('stake')}
                      >
                        Stake
                        {sortKey === 'stake' && sortDirection === 'desc' && (
                          <ArrowDownIcon className="ml-2 h-3 w-3" />
                        )}
                        {sortKey === 'stake' && sortDirection === 'asc' && (
                          <ArrowUpIcon className="ml-2 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('commission')}
                      >
                        Commission
                        {sortKey === 'commission' &&
                          sortDirection === 'desc' && (
                            <ArrowDownIcon className="ml-2 h-3 w-3" />
                          )}
                        {sortKey === 'commission' &&
                          sortDirection === 'asc' && (
                            <ArrowUpIcon className="ml-2 h-3 w-3" />
                          )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('apy')}
                      >
                        APY
                        {sortKey === 'apy' && sortDirection === 'desc' && (
                          <ArrowDownIcon className="ml-2 h-3 w-3" />
                        )}
                        {sortKey === 'apy' && sortDirection === 'asc' && (
                          <ArrowUpIcon className="ml-2 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('skippedSlots')}
                      >
                        Skipped %
                        {sortKey === 'skippedSlots' &&
                          sortDirection === 'desc' && (
                            <ArrowDownIcon className="ml-2 h-3 w-3" />
                          )}
                        {sortKey === 'skippedSlots' &&
                          sortDirection === 'asc' && (
                            <ArrowUpIcon className="ml-2 h-3 w-3" />
                          )}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center cursor-pointer"
                        onClick={() => handleSort('score')}
                      >
                        Score
                        {sortKey === 'score' && sortDirection === 'desc' && (
                          <ArrowDownIcon className="ml-2 h-3 w-3" />
                        )}
                        {sortKey === 'score' && sortDirection === 'asc' && (
                          <ArrowUpIcon className="ml-2 h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedValidators.map((validator, index) => (
                    <TableRow
                      key={`${validator.identity}-${index}`} // Use identity + index as unique key
                      className={validator.delinquent ? 'bg-red-50/10' : ''}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="font-semibold">{validator.name}</div>
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
                          <span>{validator.skippedSlots}%</span>
                          <Progress
                            value={100 - validator.skippedSlots}
                            className="h-2 w-16"
                            indicatorClassName={
                              validator.skippedSlots > 5
                                ? 'bg-amber-500'
                                : 'bg-green-500'
                            }
                          />
                        </div>
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
                            {validator.score}
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
            </ScrollArea>
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
