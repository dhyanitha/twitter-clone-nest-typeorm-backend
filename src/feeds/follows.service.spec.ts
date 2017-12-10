
import { MockFollowRepository } from './follows-repository.provider.spec';
import { Follow } from './follow.entity';
import { FollowsService } from './follows.service';

const userAUuid = '00000000-0000-0000-0000-000000000000';
const userBUuid = '00000000-0000-0000-0000-000000000001';
const userCUuid = '00000000-0000-0000-0000-000000000002';

describe('FollowsService', () => {
  let followRepo: MockFollowRepository;
  let followsService: FollowsService;

  beforeAll(async () => {
    followRepo = new MockFollowRepository();
    followsService = new FollowsService(await followRepo.connect());

    expect(followsService).toBeInstanceOf(FollowsService);
  });

  it('should be able to create follow relationship', async () => {
    // User A follows User B
    const followAB: Follow = await followsService.create(userAUuid, userBUuid);
    expect(followAB).toHaveProperty('userUuid', userAUuid);
    expect(followAB).toHaveProperty('feedOwnerUuid', userBUuid);

    const followAC: Follow = await followsService.create(userAUuid, userCUuid);
    expect(followAC).toHaveProperty('userUuid', userAUuid);
    expect(followAC).toHaveProperty('feedOwnerUuid', userCUuid);

    const followBC: Follow = await followsService.create(userBUuid, userCUuid);
    expect(followBC).toHaveProperty('userUuid', userBUuid);
    expect(followBC).toHaveProperty('feedOwnerUuid', userCUuid);
  });

  it('should be able to check follow relationship', async () => {
    expect(await followsService.isFollowing(userAUuid, userBUuid)).toBeTruthy();
    expect(await followsService.isFollowing(userAUuid, userCUuid)).toBeTruthy();
    expect(await followsService.isFollowing(userBUuid, userCUuid)).toBeTruthy();
    expect(await followsService.isFollowing(userCUuid, userBUuid)).toBeFalsy();
  });

  it('should be able to check a users follows list', async () => {
    const [followsA, count]: [Follow[], number] = await followsService
      .listFollows(userAUuid);

    expect(count).toBe(2);
    expect(followsA).toHaveLength(2);
  });

  it('should be able to check a users followers list', async () => {
    const [followersC, count]: [Follow[], number] = await followsService
      .listFollowers(userCUuid);

    expect(count).toBe(2);
    expect(followersC).toHaveLength(2);
  });

  it('should be able to remove follow relationships', async () => {
    await followsService.remove(userAUuid, userBUuid);
    await followsService.remove(userAUuid, userCUuid);
    await followsService.remove(userBUuid, userCUuid);

    expect(await followsService.isFollowing(userAUuid, userBUuid)).toBeFalsy();
    expect(await followsService.isFollowing(userAUuid, userCUuid)).toBeFalsy();
    expect(await followsService.isFollowing(userBUuid, userCUuid)).toBeFalsy();
  });

  afterAll(async () => {
    await followRepo.close();
  });
});
