import type {
  FilterQuery,
  Model,
  ProjectionType,
  QueryOptions,
  UpdateQuery,
  HydratedDocument,
} from 'mongoose';

/**
 * Thin, typed persistence boundary. Services depend on repositories, never on
 * Mongoose models directly — keeps data access swappable and testable.
 */
export abstract class BaseRepository<T> {
  protected constructor(protected readonly model: Model<T>) {}

  create(data: Partial<T>): Promise<HydratedDocument<T>> {
    return this.model.create(data) as unknown as Promise<HydratedDocument<T>>;
  }

  findById(id: string, projection?: ProjectionType<T>): Promise<HydratedDocument<T> | null> {
    return this.model.findById(id, projection).exec() as Promise<HydratedDocument<T> | null>;
  }

  findOne(
    filter: FilterQuery<T>,
    projection?: ProjectionType<T>,
  ): Promise<HydratedDocument<T> | null> {
    return this.model.findOne(filter, projection).exec() as Promise<HydratedDocument<T> | null>;
  }

  find(
    filter: FilterQuery<T>,
    options?: QueryOptions<T>,
  ): Promise<HydratedDocument<T>[]> {
    return this.model.find(filter, null, options).exec() as Promise<HydratedDocument<T>[]>;
  }

  updateById(id: string, update: UpdateQuery<T>): Promise<HydratedDocument<T> | null> {
    return this.model
      .findByIdAndUpdate(id, update, { new: true })
      .exec() as Promise<HydratedDocument<T> | null>;
  }

  updateOne(filter: FilterQuery<T>, update: UpdateQuery<T>): Promise<void> {
    return this.model.updateOne(filter, update).exec().then(() => undefined);
  }

  deleteById(id: string): Promise<void> {
    return this.model.findByIdAndDelete(id).exec().then(() => undefined);
  }

  count(filter: FilterQuery<T>): Promise<number> {
    return this.model.countDocuments(filter).exec();
  }

  exists(filter: FilterQuery<T>): Promise<boolean> {
    return this.model.exists(filter).then((r) => r !== null);
  }
}
